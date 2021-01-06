module.exports = function profile(user) {
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: false,
    },
  };
};
