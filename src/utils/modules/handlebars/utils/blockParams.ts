export function blockParams(params: Record<string, any>, ids: any) {
  return { ...params, ...{ path: ids } };
}
