export type DeckValidationResult = {
  valid: boolean;
  errors: Error[];
};

type ValidationError =
  | 'DECK_REQUIREMENTS_NOT_MET'
  | 'FORBIDDEN'
  | 'INVALID_CARD_COUNT'
  | 'INVALID_DECK_OPTION'
  | 'INVALID_INVESTIGATOR'
  | 'TOO_FEW_CARDS'
  | 'TOO_MANY_CARDS';

type BaseError = {
  type: ValidationError;
};

type TooManyCardsError = {
  type: 'TOO_MANY_CARDS';
  details: {
    target: 'slots' | 'extraSlots';
    count: number;
    countRequired: number;
  };
};

type TooFewCardsError = {
  type: 'TOO_FEW_CARDS';
  details: {
    target: 'slots' | 'extraSlots';
    count: number;
    countRequired: number;
  };
};

type DeckOptionsError = {
  type: 'INVALID_DECK_OPTION';
  details: {
    error: string;
  };
};

type DeckLimitViolation = {
  code: string;
  limit: number;
  quantity: number;
};

type InvalidCardError = {
  type: 'INVALID_CARD_COUNT';
  details: DeckLimitViolation[];
};

type DeckRequirementsNotMetError = {
  type: 'DECK_REQUIREMENTS_NOT_MET';
  details: {
    code: string;
    quantity: number;
    required: number;
  }[];
};

export type ForbiddenCardError = {
  type: 'FORBIDDEN';
  details: {
    code: string;
    target: 'slots' | 'extraSlots';
  }[];
};

export function isTooManyCardsError(error: Error): error is TooManyCardsError {
  return error.type === 'TOO_MANY_CARDS';
}

export function isDeckOptionsError(error: Error): error is DeckOptionsError {
  return error.type === 'INVALID_DECK_OPTION';
}

export function isInvalidCardCountError(error: Error): error is InvalidCardError {
  return error.type === 'INVALID_CARD_COUNT';
}

export function isForbiddenCardError(error: Error): error is ForbiddenCardError {
  return error.type === 'FORBIDDEN';
}

export function isTooFewCardsError(error: Error): error is TooFewCardsError {
  return error.type === 'TOO_FEW_CARDS';
}

export function isDeckRequirementsNotMetError(error: Error): error is DeckRequirementsNotMetError {
  return error.type === 'DECK_REQUIREMENTS_NOT_MET';
}

export function isInvalidInvestigatorError(
  error: Error
): error is BaseError & { type: 'INVALID_INVESTIGATOR' } {
  return error.type === 'INVALID_INVESTIGATOR';
}

type Error =
  | BaseError
  | InvalidCardError
  | ForbiddenCardError
  | DeckOptionsError
  | TooManyCardsError
  | TooFewCardsError
  | DeckRequirementsNotMetError;
