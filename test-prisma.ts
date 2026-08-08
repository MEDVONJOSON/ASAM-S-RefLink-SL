import prisma from './lib/db';
async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { googleId: 'test' } });
    console.log('SUCCESS', user);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}
main();
