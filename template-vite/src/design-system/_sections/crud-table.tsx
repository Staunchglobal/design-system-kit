
import * as React from 'react'

import { CrudScreen } from '@/components/crud/crud-screen'
import { graphqlFetch } from '@/components/crud/graphql-client'
import type { CrudColumn, CrudFieldDef, CrudPageParams, CrudTab } from '@/components/crud/types'
import { Button } from '@/components/ui/button'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'

const ENDPOINT = 'https://graphqlzero.almansi.me/api'

type Post = {
  id: string
  title: string
  body: string
}

const POSTS_QUERY = `
  query Posts($options: PageQueryOptions) {
    posts(options: $options) {
      data { id title body }
      meta { totalCount }
    }
  }
`

const CREATE_POST = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) { id title body }
  }
`

const UPDATE_POST = `
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) { id title body }
  }
`

const DELETE_POST = `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`

const FIELDS: CrudFieldDef[] = [
  { name: 'title', label: 'Title', required: true, maxLength: 120 },
  { name: 'body', label: 'Body', type: 'textarea', required: true },
]

const COLUMNS: CrudColumn<Post>[] = [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    pairWith: 'id',
    className: 'max-w-[14rem] truncate font-medium',
  },
  {
    key: 'body',
    header: 'Body',
    render: (row) => (
      <span className="text-muted-foreground line-clamp-2 max-w-md whitespace-normal">
        {row.body}
      </span>
    ),
  },
  {
    key: 'id',
    header: 'ID',
    mobileLabel: 'ID',
    className: 'text-muted-foreground font-mono text-xs',
  },
]

const TABS: CrudTab[] = [
  { label: 'All', value: 'all' },
  { label: 'Qui', value: 'qui' },
  { label: 'Est', value: 'est' },
]

/** Map tab → GraphQL search term (demo stand-in for status filters). */
function tabQuery(tab: string | null): string {
  if (!tab || tab === 'all') return ''
  return tab
}

async function fetchPostsPage({ page, pageSize, search, sort, tab }: CrudPageParams) {
  const q = [search, tabQuery(tab)].filter(Boolean).join(' ').trim()
  const options: Record<string, unknown> = {
    paginate: { page, limit: pageSize },
  }
  if (q) options.search = { q }
  if (sort) {
    options.sort = [{ field: sort.field, order: sort.order.toUpperCase() }]
  }

  const data = await graphqlFetch<{
    posts: { data: Post[]; meta: { totalCount: number } }
  }>(ENDPOINT, POSTS_QUERY, { options })

  return {
    items: data.posts.data ?? [],
    totalCount: data.posts.meta.totalCount ?? 0,
  }
}

function CrudScreenDemo() {
  // Toolbar slot demo — even-id “featured” filter (client-side on the current page).
  const [featuredOnly, setFeaturedOnly] = React.useState(false)

  const fetchPage = React.useCallback(
    async (params: CrudPageParams) => {
      const result = await fetchPostsPage(params)
      if (!featuredOnly) return result
      const items = result.items.filter((p) => Number(p.id) % 2 === 0)
      return { items, totalCount: items.length }
    },
    [featuredOnly]
  )

  return (
    <CrudScreen<Post>
      key={featuredOnly ? 'featured' : 'all'}
      entityLabel="post"
      columns={COLUMNS}
      fetchPage={fetchPage}
      getRowId={(p) => p.id}
      search={{ placeholder: 'Search posts…' }}
      pageSize={5}
      pageSizeOptions={[5, 10, 20]}
      tabs={TABS}
      initialTab="all"
      toolbar={
        <Button
          type="button"
          size="sm"
          variant={featuredOnly ? 'default' : 'outline'}
          onClick={() => setFeaturedOnly((v) => !v)}
        >
          {featuredOnly ? 'Featured only' : 'All IDs'}
        </Button>
      }
      empty={{
        title: 'No posts',
        description: 'Create one to get started. Mutations are patched into the list locally.',
      }}
      create={{
        title: 'Add post',
        description:
          'The public demo API does not persist mutations — the row is patched into the list locally.',
        fields: FIELDS,
        onSubmit: async (values) => {
          const data = await graphqlFetch<{ createPost: Post }>(ENDPOINT, CREATE_POST, {
            input: { title: values.title.trim(), body: values.body.trim() },
          })
          return {
            id: data.createPost.id,
            title: data.createPost.title ?? values.title.trim(),
            body: data.createPost.body ?? values.body.trim(),
          }
        },
      }}
      edit={{
        title: 'Edit post',
        description: 'Changes are applied locally after the API responds.',
        fields: FIELDS,
        onSubmit: async (values, row) => {
          const input = { title: values.title.trim(), body: values.body.trim() }
          const data = await graphqlFetch<{ updatePost: Post }>(ENDPOINT, UPDATE_POST, {
            id: row.id,
            input,
          })
          return {
            id: row.id,
            title: data.updatePost.title ?? input.title,
            body: data.updatePost.body ?? input.body,
          }
        },
      }}
      delete={{
        getTitle: (row) => `Delete “${row.title}”?`,
        getDescription: () =>
          'The demo API does not persist deletes — the row is removed from the current list.',
        onDelete: async (row) => {
          await graphqlFetch(ENDPOINT, DELETE_POST, { id: row.id })
        },
      }}
    />
  )
}

export default function CrudTableDemo() {
  return (
    <ComponentSection
      id="crud-table"
      title="CRUD Screen"
      description="Composed CrudScreen — search, tabs, toolbar slot, page size, sort, pagination, empty/error, and declarative add/edit/delete against a live public GraphQL API. Mutations patch local list state (the demo API does not persist writes)."
    >
      <Example
        title="Full CrudScreen (GraphQL Zero Posts)"
        description="Debounced search · clear · tabs · toolbar filter · page size · sort · optimistic CRUD · mobile cards below 768px"
        className="w-full"
        contentClassName="block"
      >
        <CrudScreenDemo />
      </Example>
    </ComponentSection>
  )
}
