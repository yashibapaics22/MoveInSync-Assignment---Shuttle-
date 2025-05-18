module.exports = {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRE || '24h',
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
    
    // For debugging
    debug: true, // Set to false in production
    
    // For consistent usage in middleware
    getToken: function(headers) {
      if (headers && headers.authorization) {
        const parts = headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          return parts[1];
        }
        return headers.authorization;
      }
      return headers['x-access-token'] || null;
    }
  };