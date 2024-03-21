import Joi from 'joi';

export const validationSchema = Joi.object({
  // DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSPORT: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // AUTH
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXP: Joi.string().required(),
  REFRESH_TOKEN_EXP: Joi.string().required(),
});
