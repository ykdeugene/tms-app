import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import DispatchContext from "../../DispatchContext"

function PromoteTaskModal({ selectedTask, username, fetchTasks, plans, resetSetTask }) {
  const appDispatch = useContext(DispatchContext)
  const [taskUpdatedPlan, setTaskUpdatedPlan] = useState("not set")
  const [taskNotes, setTaskNotes] = useState("")

  async function handlePromoteTask() {
    const taskNewState = selectedTask.Task_state + 1

    let taskNewPlan
    taskUpdatedPlan === "not set" ? (taskNewPlan = selectedTask.Task_plan) : (taskNewPlan = taskUpdatedPlan)

    let dateTime = new Date()

    const taskNotesStarter = "==============================\n"
    const taskNotesSignature = `\n------------------------------\nuserID: ${username}\nstate: ${["Open", "To-do", "Doing", "Done", "Closed"][taskNewState - 1]}\nDate/Time: ${dateTime}\n==============================\n`

    const taskNotesComplete = taskNotesStarter + taskNotes + taskNotesSignature + selectedTask.Task_notes

    let taskOwner = username
    let taskID = selectedTask.Task_id

    try {
      const response = await Axios.put(`/tms/update_task_status`, { taskNotesComplete, taskNewPlan, taskNewState, taskOwner, taskID })
      if (response.data === "A100") {
        appDispatch({ type: "loggedOut" })
        appDispatch({ type: "errorToast", data: "Token expired. You have been logged out." })
        return
      }
      if (response.data === true) {
        appDispatch({ type: "successToast", data: `${selectedTask.Task_id} has been promoted.` })
        var modal = document.getElementById("PromoteTaskModal")
        var form = modal.querySelector("form")
        form.reset()
        fetchTasks()
        resetSetTask()
        return
      } else {
        appDispatch({ type: "errorToast", data: `No updates made to ${selectedTask.Task_id}` })
        return
      }
    } catch (e) {
      console.log(e)
      appDispatch({ type: "errorToast", data: "Please contact an administrator. (handleUpdateApplication catch(e))" })
    }
  }

  function closeTaskModal() {
    setTaskUpdatedPlan("not set")
    setTaskNotes("")
    var modal = document.getElementById("PromoteTaskModal")
    var form = modal.querySelector("form")
    form.reset()
    resetSetTask()
  }

  return (
    <>
      <div className="modal fade" id="PromoteTaskModal" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header pt-1 pb-1">
              <div>
                <h1 className="modal-title fs-3">{`Promote Task - ${selectedTask.Task_name} (${["Open", "To-do", "Doing", "Done", "Closed"][selectedTask.Task_state - 1]})`}</h1>
                Created by {selectedTask.Task_creator} on {selectedTask.Task_createDate}
              </div>
              <button type="button" className="ms-2 btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body pt-1">
              <form>
                <div className="d-flex pb-2">
                  <div className="d-flex">
                    <div className="pe-2">
                      <label htmlFor="taskID" className="form-label mb-0 mt-1">
                        Task ID
                      </label>
                      <input value={selectedTask.Task_id} disabled type="text" className="form-control" id="taskID" />

                      <label htmlFor="taskOwner" className="form-label mb-0 mt-1">
                        Task Owner
                      </label>
                      <input value={selectedTask.Task_owner} disabled type="text" className="form-control" id="taskOwner" />
                    </div>
                    <div className="pe-2">
                      <label htmlFor="taskName" className="form-label mb-0 mt-1">
                        Task Name
                      </label>
                      <input value={selectedTask.Task_name} disabled type="text" className="form-control" id="taskName" />
                      <label htmlFor="taskPlan" className="form-label mb-0 mt-1">
                        Plan
                      </label>
                      <select
                        onChange={e => {
                          setTaskUpdatedPlan(e.target.value)
                        }}
                        disabled={!Boolean(selectedTask.Task_state === 1 || selectedTask.Task_state === 4)}
                        className="form-select"
                        id="planDropDownList"
                        style={{ width: "30vh" }}
                      >
                        {plans.map(plan => {
                          return (
                            <option selected={selectedTask.Task_plan === plan.Plan_MVP_name} key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>
                              {plan.Plan_MVP_name}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="taskDescription" className="form-label mb-0 mt-1">
                        Description
                      </label>
                      <textarea value={selectedTask.Task_description} disabled type="text" className="form-control" id="taskDescription" cols="40" rows="4" />
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <label htmlFor="taskNotes" className="form-label mb-0 mt-1">
                      Notes
                    </label>
                    <textarea value={selectedTask.Task_notes} disabled type="text" className="form-control" id="taskNotes" rows="4" />
                  </div>
                  <div>
                    <label htmlFor="taskAddNotes" className="form-label mb-0 mt-1">
                      Add Notes
                    </label>
                    <textarea
                      onChange={e => {
                        setTaskNotes(e.target.value)
                      }}
                      type="text"
                      className="form-control"
                      id="taskAddNotes"
                      rows="4"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={closeTaskModal} type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button onClick={handlePromoteTask} type="button" className="btn btn-primary" data-bs-dismiss="modal">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PromoteTaskModal
