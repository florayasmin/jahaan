// src/seed.ts - populates database with drama data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // creating genres
  const romance = await prisma.genre.upsert({
    where: { name: 'Romance' },
    update: {},
    create: { name: 'Romance' }
  });

  const drama = await prisma.genre.upsert({
    where: { name: 'Drama' },
    update: {},
    create: { name: 'Drama' }
  });

  const family = await prisma.genre.upsert({
    where: { name: 'Family' },
    update: {},
    create: { name: 'Family' }
  });

  const thriller = await prisma.genre.upsert({
    where: { name: 'Thriller' },
    update: {},
    create: { name: 'Thriller' }
  });

  const social = await prisma.genre.upsert({
    where: { name: 'Social' },
    update: {},
    create: { name: 'Social' }
  });

  // creating specific shows
  // ishq murshid
  const ishqMurshid = await prisma.show.create({
    data: {
      name: 'Ishq Murshid',
      description: 'A spiritual love story about Shibra, a hardworking girl, and Shahmeer, a wealthy young man. Their paths cross leading to an unexpected romance filled with trials and spiritual growth.',
      releaseYear: 2023,
      totalEpisodes: 40,
      channel: 'HUM TV',
      director: 'Farooq Rind',
      writer: 'Abdul Khaliq Khan',
      cast: 'Bilal Abbas Khan, Durefishan Saleem',
      status: 'Completed',
      rating: 8.5,
      genres: {
        connect: [{ id: romance.id }, { id: drama.id }]
      },
      episodes: {
        create: [
          { 
            episodeNumber: 1, 
            seasonNumber: 1, 
            title: 'The Beginning',
            airDate: new Date('2023-11-14'),
            duration: 40,
            description: 'Shibra and Shahmeer meet for the first time'
          },
          { 
            episodeNumber: 2, 
            seasonNumber: 1, 
            title: 'Unexpected Turns',
            airDate: new Date('2023-11-15'),
            duration: 40
          },
          { 
            episodeNumber: 3, 
            seasonNumber: 1, 
            title: 'Family Matters',
            airDate: new Date('2023-11-21'),
            duration: 40
          },
          { 
            episodeNumber: 4, 
            seasonNumber: 1, 
            title: 'Growing Closer',
            airDate: new Date('2023-11-22'),
            duration: 40
          },
          { 
            episodeNumber: 5, 
            seasonNumber: 1, 
            title: 'Complications Arise',
            airDate: new Date('2023-11-28'),
            duration: 40
          },
        ]
      }
    }
  });

  // kabhi main kabhi tum
  const kabhiMainKabhiTum = await prisma.show.create({
    data: {
      name: 'Kabhi Main Kabhi Tum',
      description: 'An unconventional love story between Mustafa, an aimless young man, and Sharjeena, an ambitious career woman. They enter into an unexpected marriage that transforms both their lives.',
      releaseYear: 2024,
      totalEpisodes: 35,
      channel: 'ARY Digital',
      director: 'Badar Mehmood',
      writer: 'Farhat Ishtiaq',
      cast: 'Fahad Mustafa, Hania Aamir, Emmad Irfani',
      status: 'Completed',
      rating: 9.2,
      genres: {
        connect: [{ id: romance.id }, { id: drama.id }, { id: family.id }]
      },
      episodes: {
        create: [
          { 
            episodeNumber: 1, 
            seasonNumber: 1, 
            title: 'Two Different Worlds',
            airDate: new Date('2024-07-08'),
            duration: 42,
            description: 'Mustafa and Sharjeena lead completely different lives'
          },
          { 
            episodeNumber: 2, 
            seasonNumber: 1, 
            title: 'An Unexpected Proposal',
            airDate: new Date('2024-07-09'),
            duration: 42
          },
          { 
            episodeNumber: 3, 
            seasonNumber: 1, 
            title: 'The Wedding',
            airDate: new Date('2024-07-15'),
            duration: 42
          },
          { 
            episodeNumber: 4, 
            seasonNumber: 1, 
            title: 'Adjustments',
            airDate: new Date('2024-07-16'),
            duration: 42
          },
          { 
            episodeNumber: 5, 
            seasonNumber: 1, 
            title: 'Finding Common Ground',
            airDate: new Date('2024-07-22'),
            duration: 42
          },
        ]
      }
    }
  });

  // dunk
  const dunk = await prisma.show.create({
    data: {
      name: 'Dunk',
      description: 'A gripping tale about Haider, a university professor falsely accused of harassment by his student Amal. The drama explores themes of justice, truth, and the devastating impact of false allegations on lives and families.',
      releaseYear: 2021,
      totalEpisodes: 23,
      channel: 'ARY Digital',
      director: 'Badar Mehmood',
      writer: 'Ali Moeen',
      cast: 'Bilal Abbas Khan, Sana Javed, Azra Mohyeddin, Noman Ijaz',
      status: 'Completed',
      rating: 8.7,
      genres: {
        connect: [{ id: drama.id }, { id: thriller.id }, { id: social.id }]
      },
      episodes: {
        create: [
          { 
            episodeNumber: 1, 
            seasonNumber: 1, 
            title: 'The Accusation',
            airDate: new Date('2021-01-06'),
            duration: 40,
            description: 'Haider faces a life-changing accusation'
          },
          { 
            episodeNumber: 2, 
            seasonNumber: 1, 
            title: 'The Aftermath',
            airDate: new Date('2021-01-13'),
            duration: 40
          },
          { 
            episodeNumber: 3, 
            seasonNumber: 1, 
            title: 'Seeking Justice',
            airDate: new Date('2021-01-20'),
            duration: 40
          },
          { 
            episodeNumber: 4, 
            seasonNumber: 1, 
            title: 'The Investigation',
            airDate: new Date('2021-01-27'),
            duration: 40
          },
          { 
            episodeNumber: 5, 
            seasonNumber: 1, 
            title: 'Truth Unfolds',
            airDate: new Date('2021-02-03'),
            duration: 40
          },
        ]
      }
    }
  });

  console.log('Database seeded successfully!');

  // Query to verify
  const allShows = await prisma.show.findMany({
    include: {
      genres: true,
      episodes: true,
      _count: {
        select: { episodes: true }
      }
    }
  });

  console.log('\nAll shows in database:');
  allShows.forEach(show => {
    console.log(`\n${show.name} (${show.releaseYear}) - ${show.channel}`);
    console.log(`  Status: ${show.status} | Rating: ${show.rating}/10`);
    console.log(`  Cast: ${show.cast}`);
    console.log(`  Director: ${show.director}`);
    console.log(`  Genres: ${show.genres.map(g => g.name).join(', ')}`);
    console.log(`  Episodes in DB: ${show._count.episodes}/${show.totalEpisodes}`);
    console.log(`  Description: ${show.description?.substring(0, 100)}...`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });