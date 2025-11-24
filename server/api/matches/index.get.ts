import { neon } from '@neondatabase/serverless';

export default defineCachedEventHandler(
  async (event) => {
    const { databaseUrl } = useRuntimeConfig();
    const db = neon(databaseUrl);

    const query = getQuery(event);

    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);
    const offset = (page - 1) * pageSize;

    const search = query.search?.toString().trim() || '';

    const allowedSortColumns = ['id','match_date','home_team','away_team'];
    const sortBy = allowedSortColumns.includes(query.sortBy?.toString() || '') 
      ? query.sortBy 
      : 'match_date';
    const sortDir = query.sortDir === 'desc' ? 'DESC' : 'ASC';

    const rows = await db`
      SELECT *
      FROM matches
      WHERE ${search} = '' OR home_team ILIKE ${'%' + search + '%'} OR away_team ILIKE ${'%' + search + '%'}
      ORDER BY ${db.unsafe(sortBy as string)} ${db.unsafe(sortDir)}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;
    const totalResult = await db`
      SELECT COUNT(*)::int AS total
      FROM matches
      WHERE ${search} = '' OR home_team ILIKE ${'%' + search + '%'} OR away_team ILIKE ${'%' + search + '%'}
    `;

    return {
      data: rows,
      total: totalResult[0]?.total ?? 0,
      page,
      pageSize,
    };
  },
  {
    maxAge: 60 * 60 * 24,
  }
);
