import type { User } from "./user"

export interface BlogCategory {
    _id: string
    name: string
    slug?: string
    description?: string
    isActive?: boolean
}

export interface Blog {
    _id: string
    title: string
    slug: string
    content: string
    author: User | string
    categories: BlogCategory[] | string[]
    tags: string[]
    thumbnail: string
    views: number
    likes: string[]
    comments: string[]
    isPublished: boolean
    showOnHome?: boolean
    publishedAt?: string
    createdAt: string
    updatedAt: string
}
