// src/server.ts - Express API server
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET all shows
app.get('/api/shows', async (req: Request, res: Response) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        genres: true,
        _count: {
          select: { episodes: true }
        }
      },
      orderBy: {
        releaseYear: 'desc'
      }
    });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// GET shows with search + filter
// query params: q (search term), genre, status, minRating, maxRating
app.get('/api/shows/search', async (req: Request, res: Response) => {
  try {
    const { q, genre, status, minRating, maxRating } = req.query;

    const shows = await prisma.show.findMany({
      where: {
        AND: [
          // full-text search across name, description, cast, director, writer
          q
            ? {
                OR: [
                  { name: { contains: q as string, mode: 'insensitive' } },
                  { description: { contains: q as string, mode: 'insensitive' } },
                  { cast: { contains: q as string, mode: 'insensitive' } },
                  { director: { contains: q as string, mode: 'insensitive' } },
                  { writer: { contains: q as string, mode: 'insensitive' } },
                ],
              }
            : {},
          // filter by genre name
          genre
            ? {
                genres: {
                  some: { name: { equals: genre as string, mode: 'insensitive' } },
                },
              }
            : {},
          // filter by status
          status ? { status: { equals: status as string, mode: 'insensitive' } } : {},
          // filter by rating range
          minRating ? { rating: { gte: parseFloat(minRating as string) } } : {},
          maxRating ? { rating: { lte: parseFloat(maxRating as string) } } : {},
        ],
      },
      include: {
        genres: true,
        _count: { select: { episodes: true } },
      },
      orderBy: { rating: 'desc' },
    });

    res.json({ results: shows, count: shows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET single show by ID with all episodes
app.get('/api/shows/:id', async (req: Request, res: Response) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        genres: true,
        episodes: {
          orderBy: {
            episodeNumber: 'asc'
          }
        }
      }
    });
    
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    res.json(show);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

// GET all genres
app.get('/api/genres', async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { shows: true }
        }
      }
    });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// GET shows by genre
app.get('/api/genres/:name/shows', async (req: Request, res: Response) => {
  try {
    const shows = await prisma.show.findMany({
      where: {
        genres: {
          some: {
            name: req.params.name
          }
        }
      },
      include: {
        genres: true,
        _count: {
          select: { episodes: true }
        }
      }
    });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shows by genre' });
  }
});

// POST create new show
app.post('/api/shows', async (req: Request, res: Response) => {
  try {
    const { name, description, releaseYear, channel, director, writer, cast, totalEpisodes, status, rating, genres } = req.body;
    
    const show = await prisma.show.create({
      data: {
        name,
        description,
        releaseYear,
        channel,
        director,
        writer,
        cast,
        totalEpisodes,
        status,
        rating,
        genres: {
          connect: genres?.map((genreName: string) => ({ name: genreName })) || []
        }
      },
      include: {
        genres: true
      }
    });
    
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create show' });
  }
});

// POST add episode to show
app.post('/api/shows/:id/episodes', async (req: Request, res: Response) => {
  try {
    const { episodeNumber, seasonNumber, title, airDate, duration, description } = req.body;
    
    const episode = await prisma.episode.create({
      data: {
        showId: parseInt(req.params.id),
        episodeNumber,
        seasonNumber,
        title,
        airDate: airDate ? new Date(airDate) : null,
        duration,
        description
      }
    });
    
    res.status(201).json(episode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(` GET  /api/shows - Get all shows`);
  console.log(` GET  /api/shows/search?q=&genre=&status=&minRating= - Search + filter shows`);
  console.log(` GET  /api/shows/:id - Get show by ID`);
  console.log(` GET  /api/genres - Get all genres`);
  console.log(` GET  /api/genres/:name/shows - Get shows by genre`);
  console.log(` POST /api/shows - Create new show`);
  console.log(` POST /api/shows/:id/episodes - Add episode to show`);
});

// shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
