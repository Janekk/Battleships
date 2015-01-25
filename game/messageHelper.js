var _ = require('lodash');

module.exports = {
    /**
     * Transform data to an result object with "isSuccessful" field.
     * @param {string|error|object} [data] - optional, if data is an error "isSuccessful" will set to FALSE otherwise "isSuccessful" is TRUE
     */
    toResult: function(data) {
        var result;

        if (_.isUndefined(data)) { // no data
            result = { isSuccessful: true };
        }
        else if (_.isString(data)) { // string
            result = {
                isSuccessful: true,
                message: data
            };
        }
        else if (data instanceof Error) { // error
            result = {
                isSuccessful: false,
                error: data.message
            };
        }
        else if (_.isObject(data)) { // object
            result = _.merge({ isSuccessful: true }, data);
        }
        else { // unsupported type
            throw new Error('type not supported', data);
        }

        return result;
    },

    OK: function() {
        return this.toResult();
    }
};