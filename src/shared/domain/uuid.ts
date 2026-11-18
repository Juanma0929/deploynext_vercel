const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether the text is a UUID, as the ids of the API are (ParseUUIDPipe). */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
