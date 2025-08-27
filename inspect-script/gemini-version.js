const scraper = {
  // CONFIGURATION
  friendLinkSelector: 'a:has(img[height="80"][width="80"])',
  scrollDelay: 3000,
  apiEndpoint: 'http://localhost:3000/profiles',

  // --- INTERNAL METHODS ---

  init: (startUrl) => {
    console.log('INITIALIZING SCRAPER with starting URL:', startUrl);
    localStorage.setItem('profilesToScrape', JSON.stringify([startUrl]));
    localStorage.setItem('scrapedProfiles', JSON.stringify([]));
    console.log(
      '✅ Scraper initialized! Run scraper.run() to start the process.',
    );
  },

  run: () => {
    let profilesToScrape =
      JSON.parse(localStorage.getItem('profilesToScrape')) || [];
    if (profilesToScrape.length === 0) {
      console.log('--- SCRAPING QUEUE IS EMPTY ---');
      return;
    }
    const nextProfileUrl = profilesToScrape[0];
    const targetFriendsPage = nextProfileUrl.endsWith('/friends')
      ? nextProfileUrl
      : nextProfileUrl + '/friends';

    if (!window.location.href.includes(targetFriendsPage)) {
      console.log(
        `➡️ Page does not match target. Redirecting to: ${targetFriendsPage}`,
      );
      window.location.href = targetFriendsPage;
      return;
    }

    console.log(`--- STARTING SCRAPE for: ${nextProfileUrl} ---`);
    let scrapedProfiles =
      JSON.parse(localStorage.getItem('scrapedProfiles')) || [];
    profilesToScrape.shift();
    scrapedProfiles.push(nextProfileUrl);
    localStorage.setItem('profilesToScrape', JSON.stringify(profilesToScrape));
    localStorage.setItem('scrapedProfiles', JSON.stringify(scrapedProfiles));
    scraper.startAutoScroll(() =>
      scraper.collectAndSaveFriends(nextProfileUrl),
    );
  },

  startAutoScroll: (doneCallback) => {
    let lastHeight = 0;
    const scrollInterval = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        clearInterval(scrollInterval);
        console.log('Finished scrolling.');
        if (doneCallback) doneCallback();
      }
      lastHeight = newHeight;
    }, scraper.scrollDelay);
  },

  collectAndSaveFriends: async (currentProfileUrl) => {
    console.log('Collecting friend links...');
    const friendElements = document.querySelectorAll(
      scraper.friendLinkSelector,
    );
    const foundFriendUrls = [...friendElements].map((el) =>
      el.getAttribute('href'),
    );

    console.log(
      `Found ${foundFriendUrls.length} friends. Sending to server...`,
    );
    await scraper.saveData(currentProfileUrl, foundFriendUrls);
    console.log('Data saved to backend.');

    let profilesToScrape =
      JSON.parse(localStorage.getItem('profilesToScrape')) || [];
    let scrapedProfiles =
      JSON.parse(localStorage.getItem('scrapedProfiles')) || [];
    let newProfilesAddedToQueue = 0;

    for (const url of foundFriendUrls) {
      if (!profilesToScrape.includes(url) && !scrapedProfiles.includes(url)) {
        profilesToScrape.push(url);
        newProfilesAddedToQueue++;
      }
    }

    localStorage.setItem('profilesToScrape', JSON.stringify(profilesToScrape));
    console.log(`${newProfilesAddedToQueue} new profiles added to queue.`);

    // --- NEW LOGIC: AUTOMATIC REDIRECT ---
    if (profilesToScrape.length > 0) {
      const nextUrl = profilesToScrape[0];
      const targetFriendsPage = nextUrl.endsWith('/friends')
        ? nextUrl
        : nextUrl + '/friends';
      console.log(
        `✅ SCRAPE COMPLETE. Automatically redirecting to next target: ${targetFriendsPage}`,
      );
      window.location.href = targetFriendsPage;
    } else {
      console.log(
        '✅ SCRAPE COMPLETE. Queue is now empty. Automation finished!',
      );
    }
    // --- END OF NEW LOGIC ---
  },

  saveData: async (profileUrl, friendUrls) => {
    const response = await fetch(scraper.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUrl, friendUrls }),
    });
    return response.json();
  },
};
