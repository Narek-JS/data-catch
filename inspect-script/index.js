function redirectToProfileFriendsPage(profileUrl) {
  window.location = profileUrl + '/friends';
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

function collectAllFriendLinks() {
  const allFriendProfileLinkElements = document.querySelectorAll(
    'a:has(img[height="80"][width="80"])',
  );

  const friendUrls = [];

  for (const element of allFriendProfileLinkElements) {
    friendUrls.push(element.getAttribute('href'));
  }

  // Get the main profile's URL from the current page
  const profileUrl = window.location.href;

  saveData({ profileUrl, friendUrls });
}

async function saveData(payload) {
  const url = 'http://localhost:3000/profiles';

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    method: 'POST',
  });

  const data = await response.json();
  return data;
}

startAutoScrollForOpenAllPaginatedFriends(collectAllFriendLinks);
