export const validar = (schema, fuente = 'body') => (req, res, next) => {
  const resultado = schema.safeParse(req[fuente]);
  if (!resultado.success) {
    const detalles = resultado.error.issues.map(i => ({
      campo: i.path.join('.') || fuente,
      mensaje: i.message
    }));
    return next(new ApiError(422, 'Datos inválidos', detalles));
  }
  req.validado = { ...req.validado, [fuente]: resultado.data };
  next();
};