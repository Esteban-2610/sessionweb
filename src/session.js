class Session {

    sessionExist(session) {
        return session.user != null
    }

    createSession(request, user) {

        request.session.user = {
            id: user.id,
            nombre: user.nombre
        }
    }

    destroySession(request) {

        request.session.destroy((error) => {
            if (error) {
                console.log(error)
            }
        })
    }

    getUser(session) {
        return session.user
    }
}

export default Session