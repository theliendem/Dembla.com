const express = require('express');
const app = express();
const { Redis } = require('@upstash/redis');
const redis = new Redis({
	url: 'https://pumped-grizzly-12060.upstash.io',
	token: 'AS8cAAIjcDExZWYwMjMwODU3MWI0NGQ1YjUzZGMxNmQwYTU0MDk1MXAxMA',
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
	const keys = await redis.keys('*');
	const allUrls = [];
	for (const key of keys) {
		const url = await redis.get(key);
		allUrls.push({ shortUrl: key, fullUrl: url });
	}
	res.render('index', { urls: allUrls });
});

app.post('/shortUrls', async (req, res) => {
	const fullUrl = req.body.fullUrl;
	const shortUrl = req.body.shortUrl || Math.random().toString(36).substring(2, 8);
	await redis.set(shortUrl, fullUrl);
	res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
	const fullUrl = await redis.get(req.params.shortUrl);
	if (fullUrl) {
		res.redirect(fullUrl);
	} else {
		res.status(404).render('404');
	}
});

app.post('/delete/:shortUrl', async (req, res) => {
	const shortUrl = req.params.shortUrl;
	await redis.del(shortUrl);
	res.redirect('/');
});

app.listen(process.env.PORT || 5050);