import { Request, Response } from 'express';

const loginController = {
  login: (req: Request, res: Response) => {
    const { email, action } = req.body;

    // Your login logic here
    // ...

    res.json({ message: 'Login successful.' });
  }
};

export default loginController;
