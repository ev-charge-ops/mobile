import type { Href } from 'expo-router';

let returnTarget: Href | null = null;

export function setReturnTarget(target: Href) {
  returnTarget = target;
}

export function hasReturnTarget() {
  return returnTarget !== null;
}

export function takeReturnTarget() {
  const target = returnTarget;
  returnTarget = null;
  return target;
}

export function clearReturnTarget() {
  returnTarget = null;
}
