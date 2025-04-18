export const getWorkerID = async (workers: any) => {
    let min_worker_id = ""
    let min_active_task = workers[0].active_task;
    try {
        for(const worker of workers){
            if(worker.active_task <= min_active_task){
                min_active_task = worker.active_task;
                min_worker_id = worker.worker_id;
            }
        }

        return min_worker_id;
    } catch (error) {
        console.error('Get Worker ID Error: ', error);
        throw error;
    }
}