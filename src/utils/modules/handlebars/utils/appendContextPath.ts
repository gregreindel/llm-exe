export function appendContextPath(
    contextPath: string | null | undefined,
    id: string
  ) {
    return (contextPath ? `${contextPath}.` : "") + id;
  }