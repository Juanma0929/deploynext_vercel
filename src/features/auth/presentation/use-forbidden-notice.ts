"use client";

import { useCallback, useEffect, useState } from "react";

import { onForbiddenResponse } from "../di/container";

export interface ForbiddenNoticeState {
  readonly isVisible: boolean;
  readonly dismiss: () => void;
}

/** Listens to every 403 of the API while the app shell is mounted. */
export function useForbiddenNotice(): ForbiddenNoticeState {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => onForbiddenResponse(() => setIsVisible(true)), []);

  const dismiss = useCallback(() => setIsVisible(false), []);

  return { isVisible, dismiss };
}
