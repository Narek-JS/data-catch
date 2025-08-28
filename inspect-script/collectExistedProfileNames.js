const methods = {
  redirectToNextProfilePage: () => {
    const profilesFromStorage = methods.storage.getProfiles();
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

async function saveProfileName({ fullname }) {
  const currentProfileUrl = window.location.href;

  // POST TO SAVE THIS FULLNAME FOR CURRENT PROFILE WHO HAVE THIS currentProfileUrl IN PROFILE URL.
}

async function getAllProfile(doneCb) {
  const profilesFromStorage = methods.storage.getProfiles();

  if (profilesFromStorage.length) {
    return doneCb();
  }

  const url = 'http://localhost:3000/profiles';

  try {
    const responseStream = await fetch(url);
    const response = await responseStream.json();

    methods.storage.setProfiles(response);
    doneCb();
  } catch {
    console.log('something want wrong in profiles GET request');
  }
}

getAllProfile(async () => {
  const profileFullName = getProfileName();
  if (profileFullName) {
    await saveProfileName({ fullname: profileFullName });
  }

  methods.redirectToNextProfilePage();
});
