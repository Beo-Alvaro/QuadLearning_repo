const mongoose = require('mongoose');


const strandSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String 

    },

});

const Strand = mongoose.model('Strand', strandSchema);

module.exports = Strand;