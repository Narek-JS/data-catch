const methods = {
  redirectToNextProfilePage: () => {
    const profilesFromStorage = methods.storage.getProfiles();
    if (profilesFromStorage.length === 0) {
      return;
    }

    const nextProfileUrl = profilesFromStorage.shift();
    methods.storage.setProfiles(profilesFromStorage);

    window.location = nextProfileUrl;
  },

  storage: {
    PROFILES_STORAGE_KEY: 'profiles',
    getProfiles: () => {
      const profilesStream = localStorage.getItem(
        methods.storage.PROFILES_STORAGE_KEY,
      );
      return JSON.parse(profilesStream || '[]');
    },
    setProfiles: (profiles) => {
      localStorage.setItem(
        methods.storage.PROFILES_STORAGE_KEY,
        JSON.stringify(profiles),
      );
    },
  },
};

function getProfileName() {
  const profileNameTitleElm = document.querySelector('h1');
  const profileNameChildElm = profileNameTitleElm?.querySelector('span');

  const fullname =
    (profileNameTitleElm?.innerText || '') +
    (profileNameChildElm?.innerText || '');

  return fullname;
}

async function saveProfileName({ url, name }) {
  const response = await fetch('http://localhost:3000/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, name }),
  });

  if (!response.ok) {
    console.error('Failed to save profile name.', await response.json());
  } else {
    console.log('Successfully saved.');
  }
  // POST TO SAVE THIS FULLNAME FOR CURRENT PROFILE WHO HAVE THIS currentProfileUrl IN PROFILE URL.
}

async function getProfilesToUpdate(doneCb) {
  const profilesFromStorage = methods.storage.getProfiles();

  // If we still have profiles in our local queue, just run the callback.
  if (profilesFromStorage.length) {
    return doneCb();
  }

  const url = 'http://localhost:3000/profiles/needs-update?limit=10';

  try {
    const responseStream = await fetch(url);
    const profiles = await responseStream.json();

    if (profiles.length === 0) {
      console.log('No more profiles to update. All work is done!');
      return;
    }

    const profileUrls = profiles.map((p) => p.url);
    methods.storage.setProfiles(profileUrls);
    doneCb();
  } catch (error) {
    console.error('Something went wrong fetching the profiles list:', error);
  }
}

getProfilesToUpdate(async () => {
  const profileName = getProfileName();
  const currentUrl = window.location.href;

  if (profileName) {
    await saveProfileName({ url: currentUrl, name: profileName });
  } else {
    console.log('Could not find a name on this page.');
  }

  methods.redirectToNextProfilePage();
});
