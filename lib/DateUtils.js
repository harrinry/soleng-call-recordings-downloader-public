'use strict'

exports.DateUtils =  class DateUtils {
    static formatDate (date) {
        return date.getUTCFullYear() + '-' + DateUtils.zeroPad(date.getUTCMonth()) + '-' + DateUtils.zeroPad(date.getUTCDate())
    }
    
    static formatTime (date) {
        return DateUtils.zeroPad(date.getUTCHours()) + ':' + DateUtils.zeroPad(date.getUTCMinutes()) + ':' + DateUtils.zeroPad(date.getUTCSeconds())
    }
    
    static zeroPad(date) {
        if (date < 10) {
            return '0' + date
        }
        
        return date
    }
}