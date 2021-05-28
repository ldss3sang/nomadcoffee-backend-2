import { createWriteStream } from 'fs';
import bcrypt from 'bcrypt';
import client from '../../client';
import { protectedResolver } from '../users.utils';

const resolverFn = async (
  _,
  { username, email, name, password: newPassword, location, avatarURL },
  { loggedInUser }
) => {
  console.log('edit profile resolver');
  let avatar = null;
  console.log(avatarURL);
  if (avatarURL) {
    const { filename, createReadStream } = await avatarURL;
    const newFilename = `${loggedInUser.id}-${Date.now()}-${filename}`;
    const readStream = createReadStream();
    const writeStream = createWriteStream(
      process.cwd() + '/uploads/' + newFilename
    );
    readStream.pipe(writeStream);
    avatar = `http://localhost:4000/static/${newFilename}`;
  }
  let uglyPassword = null;
  if (newPassword) {
    uglyPassword = await bcrypt.hash(newPassword, 10);
  }
  console.log(username, newPassword, name, newPassword, location, avatarURL);
  const updatedUser = await client.user.update({
    where: {
      id: loggedInUser.id,
    },
    data: {
      username,
      email,
      name,
      ...(uglyPassword && { password: uglyPassword }),
      location,
      ...(avatar && { avatarURL: avatar }),
    },
  });

  if (updatedUser.id) {
    return {
      ok: true,
    };
  } else {
    return {
      ok: false,
      error: 'Could not update profile',
    };
  }
};

export default {
  Mutation: {
    editProfile: protectedResolver(resolverFn),
  },
};
