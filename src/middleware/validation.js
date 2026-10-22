const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Mot de passe requis'
    }),
    nom: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      'any.required': 'Nom requis'
    }),
    telephone: Joi.string().pattern(/^[0-9+\s-]{10,15}$/).allow('').optional().messages({
      'string.pattern.base': 'Numéro de téléphone invalide'
    }),
    role: Joi.string().valid('candidat', 'recruteur', 'administrateur').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mot de passe requis'
    })
  }),

  updateProfile: Joi.object({
    nom: Joi.string().min(2).max(100).optional(),
    telephone: Joi.string().pattern(/^[0-9+\s-]{10,15}$/).optional().allow(''),
    bio: Joi.string().max(500).optional().allow('')
  }),

  createJob: Joi.object({
    titre: Joi.string().min(3).max(200).required().messages({
      'string.min': 'Le titre doit contenir au moins 3 caractères',
      'any.required': 'Titre requis'
    }),
    description: Joi.string().min(10).required().messages({
      'string.min': 'La description doit contenir au moins 10 caractères',
      'any.required': 'Description requise'
    }),
    entreprise: Joi.string().min(2).max(100).required().messages({
      'any.required': 'Entreprise requise'
    }),
    ville: Joi.string().min(2).max(100).required().messages({
      'any.required': 'Ville requise'
    }),
    type_contrat: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel').required().messages({
      'any.only': 'Type de contrat invalide',
      'any.required': 'Type de contrat requis'
    }),
    salaire: Joi.string().max(50).optional().allow('')
  }),

  updateJob: Joi.object({
    titre: Joi.string().min(3).max(200).optional(),
    description: Joi.string().min(10).optional(),
    entreprise: Joi.string().min(2).max(100).optional(),
    ville: Joi.string().min(2).max(100).optional(),
    type_contrat: Joi.string().valid('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel').optional(),
    salaire: Joi.string().max(50).optional().allow('')
  }),

  applyJob: Joi.object({
    lettre_motivation: Joi.string().max(1000).optional().allow('')
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({ 
        error: 'Validation échouée', 
        errors 
      });
    }

    req.body = value;
    next();
  };
};

module.exports = { schemas, validate };
