const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;
  
  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const urlList = Array.isArray(urls) ? urls : [urls];

  try {
    const requests = urlList.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: 500 });
        return response.data.numbers;
      } catch (error) {
        console.error(`Error fetching data from URL: ${url}`);
        return [];
      }
    });

    const results = await Promise.allSettled(requests);
    const validResponses = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .flat();

    const uniqueNumbers = Array.from(new Set(validResponses)).sort((a, b) => a - b);
    res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error('Error processing requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3005, () => {
  console.log('Number Management service is running on port 3005');
});