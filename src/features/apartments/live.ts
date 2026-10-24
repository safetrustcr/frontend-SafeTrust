import { currentUid, gql, GraphQLError } from "@/lib/hasura/gql";
import {
  fromRow,
  toInsertObject,
  type ApartmentRow,
  type ImageRow,
} from "./mappers";
import type {
  ApartmentInput,
  ApartmentsRepository,
  OwnedApartment,
} from "./repository";

// Hasura's default names for tables in the `safetrust` schema (no custom_name).
const APARTMENTS = "safetrust_apartments";
const INSERT_APARTMENT = "insert_safetrust_apartments_one";
const UPDATE_APARTMENTS = "update_safetrust_apartments";
const APARTMENT_INSERT_INPUT = "safetrust_apartments_insert_input";
const APARTMENT_SET_INPUT = "safetrust_apartments_set_input";
const IMAGES = "safetrust_apartment_images";
const INSERT_IMAGES_FIELD = "insert_safetrust_apartment_images";
const DELETE_IMAGES_FIELD = "delete_safetrust_apartment_images";
const IMAGE_INSERT_INPUT = "safetrust_apartment_images_insert_input";

const FIELDS = /* GraphQL */ `
  id
  name
  description
  price
  warranty_deposit
  address
  coordinates
  is_available
  available_from
  available_until
  bedrooms
  bathrooms
  pet_friendly
  created_at
`;

// Hosts may also read other hosts' published apartments (IC-08), so reads
// filter by owner. Writes never send owner_id: Hasura sets and checks it.
const LIST_MINE = /* GraphQL */ `
  query MyApartments($ownerId: String!) {
    ${APARTMENTS}(
      where: { owner_id: { _eq: $ownerId }, deleted_at: { _is_null: true } }
      order_by: { created_at: desc }
    ) {
      ${FIELDS}
    }
  }
`;

const GET = /* GraphQL */ `
  query MyApartment($id: uuid!, $ownerId: String!) {
    ${APARTMENTS}(
      where: {
        id: { _eq: $id }
        owner_id: { _eq: $ownerId }
        deleted_at: { _is_null: true }
      }
      limit: 1
    ) {
      ${FIELDS}
    }
  }
`;

const IMAGES_OF = /* GraphQL */ `
  query ApartmentImages($ids: [uuid!]!) {
    ${IMAGES}(where: { apartment_id: { _in: $ids } }) {
      apartment_id
      image_url
    }
  }
`;

const INSERT = /* GraphQL */ `
  mutation CreateApartment($object: ${APARTMENT_INSERT_INPUT}!) {
    ${INSERT_APARTMENT}(object: $object) {
      id
      created_at
    }
  }
`;

const INSERT_IMAGES = /* GraphQL */ `
  mutation AddApartmentImages($objects: [${IMAGE_INSERT_INPUT}!]!) {
    ${INSERT_IMAGES_FIELD}(objects: $objects) {
      affected_rows
    }
  }
`;

const UPDATE = /* GraphQL */ `
  mutation UpdateApartment($id: uuid!, $set: ${APARTMENT_SET_INPUT}!) {
    ${UPDATE_APARTMENTS}(
      where: { id: { _eq: $id }, deleted_at: { _is_null: true } }
      _set: $set
    ) {
      affected_rows
      returning {
        created_at
      }
    }
  }
`;

// One request, so Hasura replaces the images in a single transaction.
const REPLACE_IMAGES = /* GraphQL */ `
  mutation ReplaceApartmentImages(
    $id: uuid!
    $images: [${IMAGE_INSERT_INPUT}!]!
  ) {
    ${DELETE_IMAGES_FIELD}(where: { apartment_id: { _eq: $id } }) {
      affected_rows
    }
    ${INSERT_IMAGES_FIELD}(objects: $images) {
      affected_rows
    }
  }
`;

const SOFT_DELETE = /* GraphQL */ `
  mutation RemoveApartment($id: uuid!, $at: timestamptz!) {
    ${UPDATE_APARTMENTS}(
      where: { id: { _eq: $id }, deleted_at: { _is_null: true } }
      _set: { deleted_at: $at }
    ) {
      affected_rows
    }
  }
`;

type AffectedRows = { affected_rows: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const notFound = () => new GraphQLError("Apartment not found", "NOT_FOUND");

const imageObjects = (id: string, urls: string[]) =>
  urls.map((url) => ({ apartment_id: id, image_url: url }));

async function withImages(rows: ApartmentRow[]): Promise<OwnedApartment[]> {
  if (!rows.length) return [];
  const data = await gql<Record<string, ImageRow[]>>(IMAGES_OF, {
    ids: rows.map((row) => row.id),
  });
  const images = data[IMAGES];
  return rows.map((row) =>
    fromRow(
      row,
      images
        .filter((image) => image.apartment_id === row.id)
        .map((image) => image.image_url),
    ),
  );
}

const softDelete = (id: string) =>
  gql<Record<string, AffectedRows>>(SOFT_DELETE, {
    id,
    at: new Date().toISOString(),
  });

/**
 * Re-reads a record that was just written. The write already committed, so a
 * failed read falls back to the input instead of reporting a failed save.
 */
async function readBack(
  repository: ApartmentsRepository,
  id: string,
  input: ApartmentInput,
  createdAt: string,
): Promise<OwnedApartment> {
  try {
    const saved = await repository.get(id);
    if (saved) return saved;
  } catch {
    // Fall through to the input.
  }
  return { ...input, id, createdAt, offers: 0 };
}

export const liveApartments: ApartmentsRepository = {
  mode: "live",

  async listMine() {
    const ownerId = await currentUid();
    const data = await gql<Record<string, ApartmentRow[]>>(LIST_MINE, {
      ownerId,
    });
    return withImages(data[APARTMENTS]);
  },

  async get(id) {
    // A non-UUID can't be a live apartment; Hasura would reject the variable.
    if (!UUID.test(id)) return null;
    const ownerId = await currentUid();
    const data = await gql<Record<string, ApartmentRow[]>>(GET, {
      id,
      ownerId,
    });
    const [apartment] = await withImages(data[APARTMENTS]);
    return apartment ?? null;
  },

  async create(input) {
    const data = await gql<Record<string, { id: string; created_at: string }>>(
      INSERT,
      { object: toInsertObject(input) },
    );
    const { id, created_at } = data[INSERT_APARTMENT];
    if (input.imageUrls.length) {
      try {
        await gql(INSERT_IMAGES, {
          objects: imageObjects(id, input.imageUrls),
        });
      } catch (error) {
        // Undo the apartment so a resubmit doesn't leave a duplicate.
        await softDelete(id).catch(() => undefined);
        throw error;
      }
    }
    return readBack(this, id, input, created_at);
  },

  async update(id, input) {
    const data = await gql<
      Record<string, AffectedRows & { returning: { created_at: string }[] }>
    >(UPDATE, { id, set: toInsertObject(input) });
    const updated = data[UPDATE_APARTMENTS];
    if (!updated.affected_rows) throw notFound();
    await gql(REPLACE_IMAGES, {
      id,
      images: imageObjects(id, input.imageUrls),
    });
    return readBack(this, id, input, updated.returning[0]?.created_at ?? "");
  },

  async remove(id) {
    const data = await softDelete(id);
    if (!data[UPDATE_APARTMENTS].affected_rows) throw notFound();
  },
};
