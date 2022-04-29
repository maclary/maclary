import { z } from 'zod';
import { Command } from '../../structures/Command';
import { Precondition } from '../../structures/Precondition';

export const validate = (predicate: any, def: any, value: any) =>
    predicate.default(def).parse(value);

export const typePredicate = z.union([
    z.nativeEnum(Command.Type),
    z.nativeEnum(Command.OptionType),
]);
export const validateType = (type: any) => typePredicate.parse(type);

export const kindPredicate = z.nativeEnum(Command.Kind);
export const validateKind = (kinds: any) => kindPredicate.parse(kinds);

export const namePredicate = z.string().regex(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u);
export const validateName = (name: any) => namePredicate.parse(name);

export const aliasPredicate = namePredicate;
export const validateAlias = (aliases: any) => aliasPredicate.parse(aliases);

export const descriptionPredicate = z.string().min(1).max(100);
export const validateDescription = (description: any) => descriptionPredicate.parse(description);

export const categoryPredicate = namePredicate;
export const validateCategory = (category: any) => categoryPredicate.parse(category);

export const preconditionPredicate = z.instanceof(Precondition as any);
export const validatePrecondition = (precondition: any) =>
    preconditionPredicate.parse(precondition?.prototype);
