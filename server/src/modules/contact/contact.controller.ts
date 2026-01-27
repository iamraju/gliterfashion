import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { z } from 'zod';

const contactService = new ContactService();

const contactFormSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().optional()
});

export class ContactController {
  async submitContactForm(req: Request, res: Response) {
    try {
      const validatedData = contactFormSchema.parse(req.body);
      const submissionData = {
          ...validatedData,
          phone: validatedData.phone || null,
          message: validatedData.message || null
      };
      
      const submission = await contactService.submitContactForm(submissionData);
      res.status(201).json(submission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation Error', errors: error.issues });
      }
      res.status(500).json({ message: 'Failed to submit contact form' });
    }
  }

  async getAllSubmissions(req: Request, res: Response) {
    try {
      const submissions = await contactService.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch contact submissions' });
    }
  }

  async deleteSubmission(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) {
          return res.status(400).json({ message: 'ID is required' });
      }
      await contactService.deleteSubmission(id);
      res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete submission' });
    }
  }
}
