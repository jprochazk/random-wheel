class Application {
    init(...args) {}
    update() {}
    render(time) {}
}

class Runtime {
    static rate = 30;
    static max_consecutive_updates = 5;

    static start(app, ...args) {
        const update_time_delta = 1000 / this.rate;
        let next_game_tick = Date.now();

        const loop = () => {
            const now = Date.now();
            let processed_update_count = 0;
            while (
                now > next_game_tick &&
                processed_update_count++ < this.max_consecutive_updates
            ) {
                app.update();
                next_game_tick += update_time_delta;
            }
            app.render(now);
            window.requestAnimationFrame(loop);
        };
        app.init(...args);
        window.requestAnimationFrame(loop);
    }
}
