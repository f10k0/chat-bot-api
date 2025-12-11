const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${req.method} ${req.url}`);
    
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Тело запроса:', req.body);
    }
    
    if (Object.keys(req.query).length > 0) {
        console.log('Query параметры:', req.query);
    }
    
    if (Object.keys(req.params).length > 0) {
        console.log('Params параметры:', req.params);
    }
    
    next();
};

module.exports = logger;