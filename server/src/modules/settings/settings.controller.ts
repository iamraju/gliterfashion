import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { createShippingMethodSchema, updateShippingMethodSchema } from './dto/shipping-method.dto';
import { createPaymentMethodSchema, updatePaymentMethodSchema } from './dto/payment-method.dto';

const settingsService = new SettingsService();

export class SettingsController {
  // Shipping Methods
  async getAllShippingMethods(req: Request, res: Response) {
    try {
      const methods = await settingsService.getAllShippingMethods();
      
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      const methodsWithUrl = methods.map(method => ({
        ...method,
        imageUrl: method.imageUrl && !method.imageUrl.startsWith('http') 
          ? `${baseUrl}${method.imageUrl}` 
          : method.imageUrl
      }));

      res.json(methodsWithUrl);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch shipping methods' });
    }
  }

  async getShippingMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const method = await settingsService.getShippingMethodById(id);
      if (!method) return res.status(404).json({ message: 'Shipping method not found' });

      if (method.imageUrl && !method.imageUrl.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
        method.imageUrl = `${baseUrl}${method.imageUrl}`;
      }

      res.json(method);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch shipping method' });
    }
  }

  async createShippingMethod(req: Request, res: Response) {
    try {
      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }
      
      const validatedData = createShippingMethodSchema.parse(bodyData);
      const method = await settingsService.createShippingMethod(validatedData);
      res.status(201).json(method);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: error.message || 'Failed to create shipping method' });
    }
  }

  async updateShippingMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      
      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }

      const validatedData = updateShippingMethodSchema.parse(bodyData);
      const method = await settingsService.updateShippingMethod(id, validatedData);
      res.json(method);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: error.message || 'Failed to update shipping method' });
    }
  }

  async deleteShippingMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await settingsService.deleteShippingMethod(id);
      res.json({ message: 'Shipping method deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete shipping method' });
    }
  }

  // Payment Methods
  async getAllPaymentMethods(req: Request, res: Response) {
    try {
      const methods = await settingsService.getAllPaymentMethods();
      
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      const methodsWithUrl = methods.map(method => ({
        ...method,
        imageUrl: method.imageUrl && !method.imageUrl.startsWith('http') 
          ? `${baseUrl}${method.imageUrl}` 
          : method.imageUrl
      }));

      res.json(methodsWithUrl);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  }

  async getPaymentMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const method = await settingsService.getPaymentMethodById(id);
      if (!method) return res.status(404).json({ message: 'Payment method not found' });

      if (method.imageUrl && !method.imageUrl.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
        method.imageUrl = `${baseUrl}${method.imageUrl}`;
      }

      res.json(method);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch payment method' });
    }
  }

  async createPaymentMethod(req: Request, res: Response) {
    try {
      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }

      const validatedData = createPaymentMethodSchema.parse(bodyData);
      const method = await settingsService.createPaymentMethod(validatedData);
      res.status(201).json(method);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: error.message || 'Failed to create payment method' });
    }
  }

  async updatePaymentMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });

      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }

      const validatedData = updatePaymentMethodSchema.parse(bodyData);
      const method = await settingsService.updatePaymentMethod(id, validatedData);
      res.json(method);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: error.message || 'Failed to update payment method' });
    }
  }

  async deletePaymentMethod(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await settingsService.deletePaymentMethod(id);
      res.json({ message: 'Payment method deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete payment method' });
    }
  }

  // Site Settings
  async getPublicSettings(req: Request, res: Response) {
    try {
      const settings = await settingsService.getPublicSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch public settings' });
    }
  }

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await settingsService.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      // Expecting an array of { key, value, group? }
      const settings = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: 'Invalid settings data. Expected array.' });
      }
      
      await settingsService.updateSettings(settings);
      
      // Return updated settings
      const updatedSettings = await settingsService.getAllSettings();
      res.json(updatedSettings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  }
}
