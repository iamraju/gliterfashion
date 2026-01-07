"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesController = void 0;
const attributes_service_1 = require("./attributes.service");
const attributes_dto_1 = require("./dto/attributes.dto");
const attributesService = new attributes_service_1.AttributesService();
class AttributesController {
    async getAllAttributes(req, res) {
        try {
            const attributes = await attributesService.findAll();
            res.json(attributes);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getAttribute(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Attribute ID required');
            const attribute = await attributesService.findById(id);
            res.json(attribute);
        }
        catch (error) {
            if (error.message === 'Attribute not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async createAttribute(req, res) {
        try {
            const data = attributes_dto_1.createAttributeSchema.parse(req.body);
            const attribute = await attributesService.create(data);
            res.status(201).json(attribute);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async updateAttribute(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Attribute ID required');
            const data = attributes_dto_1.updateAttributeSchema.parse(req.body);
            const attribute = await attributesService.update(id, data);
            res.json(attribute);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            if (error.message === 'Attribute not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async deleteAttribute(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Attribute ID required');
            await attributesService.delete(id);
            res.status(200).json({ message: 'Attribute deleted successfully' });
        }
        catch (error) {
            if (error.message === 'Attribute not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AttributesController = AttributesController;
//# sourceMappingURL=attributes.controller.js.map