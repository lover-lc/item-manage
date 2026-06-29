#!/usr/bin/env node
/**
 * Clear all todos and seed 100 personal todos for 帅气超哥 (gantt preview).
 * Plain self todos only — no assignment / negotiation statuses.
 * Usage: node --env-file=.env.local scripts/seed-gantt-todos.mjs
 */
import pg from 'pg'

const PROJECT_REF = 'liedowqqnzrklygdaqkw'
const MEMBER_NAME = '帅气超哥'
const TOTAL = 100
const password = process.env.SUPABASE_DB_PASSWORD

if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD in .env.local')
  process.exit(1)
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`

const DATE_MIN_OFFSET = -200
const DATE_MAX_OFFSET = 420

function addDays(base, days) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat() {
  return Math.random()
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

const today = new Date()
const todayIso = today.toISOString().slice(0, 10)

const priorities = ['high', 'medium', 'low', null]
const titles = [
  '整理书房',
  '更换滤芯',
  '预约体检',
  '缴纳物业费',
  '洗车',
  '买菜',
  '健身计划',
  '阅读章节',
  '项目复盘',
  '备份照片',
  '清理邮箱',
  '维修门锁',
  '准备出差',
  '写周报',
  '联系师傅',
  '更新保险',
  '修剪绿植',
  '整理发票',
  '换季收纳',
  '设备维护',
  '核对账单',
  '预约牙医',
  '更新简历',
  '整理相册',
  '采购礼物',
  '拖地',
  '换床单',
  '交水电费',
  '还图书馆书',
  '整理衣柜',
]

/** Evenly spread due dates across the window, plus jitter. */
function randomDueOffset(index, total) {
  const span = DATE_MAX_OFFSET - DATE_MIN_OFFSET
  const slot = DATE_MIN_OFFSET + (span * (index + randomFloat())) / total
  const jitter = randomInt(-12, 12)
  return Math.round(Math.min(DATE_MAX_OFFSET, Math.max(DATE_MIN_OFFSET, slot + jitter)))
}

function buildTodo(index, total) {
  const priority = pick(priorities)
  const title = `${pick(titles)} #${index + 1}`

  if (randomFloat() < 0.05) {
    return {
      title,
      status: 'in_progress',
      priority,
      startDate: null,
      dueDate: null,
      completedAt: null,
    }
  }

  const dueOffset = randomDueOffset(index, total)
  let dueDate = addDays(today, dueOffset)
  let startDate = null
  let completedAt = null

  const isCompleted = dueOffset < randomInt(-30, 0) ? randomFloat() < 0.7 : randomFloat() < 0.22
  const status = isCompleted ? 'completed' : 'in_progress'

  const spanDays = randomInt(1, randomInt(2, 60))

  if (isCompleted) {
    completedAt = new Date(
      `${dueDate}T${String(randomInt(8, 20)).padStart(2, '0')}:00:00Z`,
    ).toISOString()
  }

  if (randomFloat() < 0.45) {
    startDate = addDays(dueDate, -spanDays)
    if (startDate > dueDate) [startDate, dueDate] = [dueDate, startDate]
  } else if (randomFloat() < 0.25) {
    const startOffset = dueOffset - randomInt(spanDays, spanDays + randomInt(10, 90))
    startDate = addDays(today, startOffset)
    if (startDate > dueDate) {
      dueDate = addDays(startDate, randomInt(3, 21))
    }
  }

  if (randomFloat() < 0.3) {
    startDate = null
  }

  return { title, status, priority, startDate, dueDate, completedAt }
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log('Connected')

  const memberRes = await client.query(
    `SELECT id, user_id FROM public.todo_family_members WHERE name = $1 LIMIT 1`,
    [MEMBER_NAME],
  )
  if (memberRes.rows.length === 0) {
    console.error(`Member "${MEMBER_NAME}" not found`)
    process.exit(1)
  }
  const memberId = memberRes.rows[0].id
  console.log(`Member: ${MEMBER_NAME} (${memberId})`)

  let listRes = await client.query(
    `SELECT id FROM public.todo_lists WHERE owner_id = $1 ORDER BY sort_order, created_at LIMIT 1`,
    [memberId],
  )
  let listId
  if (listRes.rows.length === 0) {
    listRes = await client.query(
      `INSERT INTO public.todo_lists (name, owner_id, color, sort_order, visibility)
       VALUES ('默认清单', $1, '#2c3e50', 0, 'private')
       RETURNING id`,
      [memberId],
    )
    listId = listRes.rows[0].id
    console.log('Created default list')
  } else {
    listId = listRes.rows[0].id
  }

  const del = await client.query(`DELETE FROM public.todo_items`)
  console.log(`Cleared todos (deleted ${del.rowCount ?? 'all'} rows)`)

  const todos = Array.from({ length: TOTAL }, (_, i) => buildTodo(i, TOTAL))

  for (let offset = 0; offset < todos.length; offset += 50) {
    const batch = todos.slice(offset, offset + 50)
    const values = []
    const params = []
    let p = 1

    for (const t of batch) {
      values.push(
        `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, false)`,
      )
      params.push(
        t.title,
        null,
        listId,
        memberId,
        memberId,
        t.priority,
        t.startDate,
        t.dueDate,
        t.status,
        t.completedAt,
      )
    }

    await client.query(
      `INSERT INTO public.todo_items (
        title, description, list_id, creator_id, assignee_id,
        priority, start_date, due_date, status, completed_at,
        require_feedback
      ) VALUES ${values.join(', ')}`,
      params,
    )
  }

  await client.query(
    `INSERT INTO public.todo_item_member_lists (todo_item_id, member_id, list_id)
     SELECT id, creator_id, list_id FROM public.todo_items
     ON CONFLICT DO NOTHING`,
  )

  const stats = await client.query(`
    SELECT status, COUNT(*)::int AS n
    FROM public.todo_items
    GROUP BY status
    ORDER BY status
  `)
  const dated = await client.query(`
    SELECT
      MIN(due_date) AS min_due,
      MAX(due_date) AS max_due,
      COUNT(*) FILTER (WHERE start_date IS NULL AND due_date IS NOT NULL)::int AS due_only,
      COUNT(*) FILTER (WHERE start_date IS NOT NULL)::int AS with_start,
      COUNT(*) FILTER (WHERE due_date IS NULL)::int AS no_due
    FROM public.todo_items
  `)

  console.log(`Seeded ${TOTAL} personal todos for ${MEMBER_NAME}`)
  console.log('Status breakdown:', stats.rows)
  console.log('Date span:', dated.rows[0])
  console.log(`Window: ${DATE_MIN_OFFSET} .. ${DATE_MAX_OFFSET} days from ${todayIso}`)
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
