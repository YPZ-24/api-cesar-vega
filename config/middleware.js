module.exports = {
    settings: {
        parser: {
            enabled: true,
            multipart: true,
            formidable: {
            maxFileSize: 600 * 1024 * 1024 // 600mb
            }
        }
    },
};