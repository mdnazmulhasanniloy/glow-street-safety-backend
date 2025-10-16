import HashPassword from '@app/shared/hashPassword';
import prisma from '@app/shared/prisma';

export async function defaultTask() {
  // Add your default task here

  // check admin is exist
  const admin = await prisma.user.findFirst({
    where: {
      role: 'admin',
    },
  });
  if (!admin) {
    const pass = await HashPassword('112233');
    const user = await prisma.user.create({
      data: {
        name: 'MD Admin',
        email: 'admin@gmail.com',
        phoneNumber: '+8801321834780',
        password: pass,
        role: 'admin',
      },
    });

    await prisma.verification.create({
      data: {
        userId: user.id,
        otp: 0,
        status: true,
      },
    });
  }

  const content = await prisma?.contents.findFirst({});
  if (!content) {
    await prisma.contents.create({
      data: {
        aboutUs: '',
        termsAndCondition: '',
        privacyPolicy: '',
      },
    });
  }
}
