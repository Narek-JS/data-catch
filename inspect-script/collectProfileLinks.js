const methods = {
  redirectToProfileFriendsPage: (profileUrl) => {
    window.location = profileUrl + '/friends';
  },

  findAllFriendProfileLinkElements: () => {
    const getThatPoint = () => {
      const currentPageURL = window.location.href;
      const allLinks = document.querySelectorAll('a');

      const friendsLinks = Array.from(allLinks).filter(
        (link) =>
          link.textContent.trim() === 'Друзья' && link.href === currentPageURL,
      );

      return friendsLinks[1];
    };

    const targetLink = getThatPoint();
    const searchInput = document.querySelector('input[placeholder="Поиск"]');

    let finalContainerDiv = null;

    if (targetLink && searchInput) {
      let lowestCommonAncestor = null;
      let parent = targetLink.parentElement;

      while (parent) {
        if (parent.contains(searchInput)) {
          lowestCommonAncestor = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (lowestCommonAncestor) {
        finalContainerDiv = lowestCommonAncestor.parentElement;
      }
    }

    return finalContainerDiv.querySelectorAll(
      'a:has(img[height="80"][width="80"])',
    );
  },

  storage: {
    PROFILES_STORAGE_KEY: 'currentProfileFriends',
    getCurrentProfileFriends: () => {
      const currentProfileFriendsStream = localStorage.getItem(
        methods.storage.PROFILES_STORAGE_KEY,
      );
      return JSON.parse(currentProfileFriendsStream || '[]');
    },
    setProfileFriends: (profileFriends) => {
      localStorage.setItem(
        methods.storage.PROFILES_STORAGE_KEY,
        JSON.stringify(profileFriends),
      );
    },
  },
};

function startAutoScrollForOpenAllPaginatedFriends(doneCb) {
  const MINUTE = 4.5;
  const TIMEOUT_DURATION = MINUTE * 60 * 1000;

  let lastHeight = 0;
  let isDone = false;
  let scrollInterval;
  let timeoutId;

  const finish = () => {
    if (isDone) return;

    isDone = true;

    clearInterval(scrollInterval);
    clearTimeout(timeoutId);
    doneCb();
  };

  scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const newHeight = document.body.scrollHeight;

    if (newHeight === lastHeight) {
      finish();
    }

    lastHeight = newHeight;
  }, 5000);

  timeoutId = setTimeout(() => {
    finish();
  }, TIMEOUT_DURATION);
}

function collectAllFriendLinks(doneCb) {
  const allFriendProfileLinkElements =
    methods.findAllFriendProfileLinkElements();

  const links = [];

  for (const element of allFriendProfileLinkElements) {
    links.push(element.getAttribute('href'));
  }

  const currentProfileUrl = window.location.href.replace('/friends', '');
  doneCb({ currentProfileUrl, links });
}

async function saveLinks({ currentProfileUrl, links }, doneCb) {
  const url = 'http://localhost:3000/profiles';

  const responseStream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileUrl: currentProfileUrl, friendUrls: links }),
  });

  const response = await responseStream.json();
  const friends = response.friends.map((friend) => friend.url);
  doneCb({ friends });

  return response;
}

function moveToCollectNextOneFriends(friends) {
  const profileFriends = methods.storage.getCurrentProfileFriends();
  const friendsProcess = profileFriends.length ? profileFriends : [...friends];

  const firstProfileLink = friendsProcess.shift();
  methods.storage.setProfileFriends(friendsProcess);
  methods.redirectToProfileFriendsPage(firstProfileLink);
}

startAutoScrollForOpenAllPaginatedFriends(() => {
  collectAllFriendLinks(({ currentProfileUrl, links }) => {
    saveLinks({ currentProfileUrl, links }, ({ friends }) => {
      moveToCollectNextOneFriends(friends);
    });
  });
});
