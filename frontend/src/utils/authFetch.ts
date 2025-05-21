export const authFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwt')

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
}
