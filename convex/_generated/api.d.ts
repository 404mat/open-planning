/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons from "../crons.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_room_id_generator from "../lib/room_id_generator.js";
import type * as lib_sessions from "../lib/sessions.js";
import type * as participants from "../participants.js";
import type * as players from "../players.js";
import type * as rooms from "../rooms.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  "lib/constants": typeof lib_constants;
  "lib/room_id_generator": typeof lib_room_id_generator;
  "lib/sessions": typeof lib_sessions;
  participants: typeof participants;
  players: typeof players;
  rooms: typeof rooms;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
