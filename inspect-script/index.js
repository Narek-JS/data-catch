const methods = {
  getFriends: async () => {
    const url =
      'http://localhost:3000/profiles?url=' + methods.getCurrentProfileUrl();

    const response = await fetch(url);

    const data = await response.json();

    if (data.length) {
      return data;
    }

    return [];
  },

  getCurrentProfileUrl: () => {
    const currentProfileUrl = window.location.pathname.replace('/friends', '');

    return currentProfileUrl;
  },
};

function redirectToProfileFriendsPage(profileUrl) {
  if (window.location.href !== profileUrl + '/friends') {
    window.location = profileUrl + '/friends';
  }
}

function startAutoScrollForOpenAllPaginatedFriends(done) {
  let lastHeight = 0;

  const scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);

    const newHeight = document.body.scrollHeight;

    if (newHeight === lastHeight) {
      clearInterval(scrollInterval);

      if (done) {
        done();
      }
    }

    lastHeight = newHeight;
  }, 5000);
}

async function collectAllFriendLinks() {
  const allFriendProfileLinkElements = document.querySelectorAll(
    'a:has(img[height="80"][width="80"])',
  );

  const friendUrls = [];

  for (const element of allFriendProfileLinkElements) {
    friendUrls.push(element.getAttribute('href'));
  }

  const profileUrl = methods.getCurrentProfileUrl();

  await saveData({ profileUrl, friendUrls });
}

async function saveData({ profileUrl, friendUrls }) {
  const url = 'http://localhost:3000/profiles';

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileUrl, friendUrls }),
    method: 'POST',
  });

  await response.json();
}

async function start() {
  const friendUrls = await methods.getFriends();
}
