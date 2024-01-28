import axios from "axios"
import {
  changeBio,
  changeCountry,
  changeProfilePicture,
  login,
} from "../features/session/sessionSlice"
import { AppDispatch } from "../Store"
import { defaultPfpURL, errorMsgEnding } from "../constants"
import { changeColorTheme } from "../features/settings/settingsSlice"
import { clearHabits } from "../features/completedHabits/completedHabitsSlice"
import { UserTypes } from "../Types"
import { SelectChangeEvent } from "@mui/material"
import { sendNotification } from "./SharedUtils"

export const handlePfpDelete = async (
  userPfp: string,
  dispatch: AppDispatch,
  replace: boolean
) => {
  const pfpFileName = getPfpFileName(userPfp)
  await axios
    .delete(`http://localhost:5432/user-settings/delete-profile-picture`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      data: JSON.stringify({ pfpFileName: pfpFileName }),
    })
    .then((response) => {
      if (!replace) {
        dispatch(changeProfilePicture(defaultPfpURL))
      }
      sendNotification(response.data.success, true)
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

export const getPfpLink = (linkString: string) => {
  try {
    const pfpData = JSON.parse(linkString)
    const pfpURL = pfpData.url
    return pfpURL
  } catch {
    return linkString
  }
}

export const getPfpFileName = (linkString: string) => {
  try {
    const pfpData = JSON.parse(linkString)
    const pfpFileName = pfpData.fileName
    return pfpFileName
  } catch {
    return linkString
  }
}

export const handleThemeChange = (
  colorTheme: string,
  dispatch: AppDispatch
) => {
  axios
    .patch(
      `http://localhost:5432/user-settings/change-theme`,
      JSON.stringify({ theme: colorTheme === "dark" ? "light" : "dark" }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    )
    .then((response) => {
      dispatch(changeColorTheme(response.data.theme))
      if (response.data.theme === "dark") {
        document.body.style.backgroundColor = "#121212"
      } else {
        document.body.style.backgroundColor = "#fff"
      }
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

export const handleUserDelete = async (
  pfp: string | undefined,
  dispatch: AppDispatch,
  auth0logout: () => void
) => {
  if (pfp) {
    await handlePfpDelete(pfp, dispatch, false)
  }

  await axios
    .delete(`http://localhost:5432/delete-user`, { withCredentials: true })
    .then((response) => {
      dispatch(changeColorTheme("light"))
      document.body.style.backgroundColor = "#fff"

      dispatch(clearHabits())
      auth0logout()
      sendNotification(response.data.success, true)
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

type LocalUserDataTypes = {
  firstName: string
  lastName: string
  username: string
}

export const handleUserDataChange = (
  e: React.FormEvent<HTMLFormElement>,
  userData: LocalUserDataTypes,
  dispatch: AppDispatch,
  user: UserTypes
) => {
  e.preventDefault()

  axios
    .patch(
      `http://localhost:5432/user-settings/change-creds`,
      JSON.stringify(userData),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    )
    .then((response) => {
      dispatch(login({ ...user, ...response.data }))
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

export const handleCountryChange = (
  e: SelectChangeEvent,
  dispatch: AppDispatch
) => {
  if (!e.target.value) {
    return console.error("e target is empty")
  }
  axios
    .patch(
      `http://localhost:5432/user-settings/change-country`,
      JSON.stringify({ country: e.target.value }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    )
    .then((response) => {
      dispatch(changeCountry(e.target.value))
      sendNotification(response.data.success, true)
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

export const handleBioChange = (
  bio: string,
  dispatch: AppDispatch,
  setIsBioChanged: (value: React.SetStateAction<boolean>) => void
) => {
  axios
    .patch(
      `http://localhost:5432/user-settings/change-bio`,
      JSON.stringify({ bio: bio }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    )
    .then((response) => {
      dispatch(changeBio(bio))
      setIsBioChanged(false)
      sendNotification(response.data.success, true)
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
}

export const getHabitCategories = async () => {
  const res = await axios
    .get("http://localhost:5432/all-habit-categories")
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
    })
  return res
}

export const handleChangePriorityCategory = async (
  newCategory: string,
  newCategoryId: number,
  user: UserTypes
) => {
  const categoryData = {
    cat1: user?.priority_category_1,
    cat2: user?.priority_category_2,
    cat3: user?.priority_category_3,
    userId: user?.id,
    catToChange: newCategory,
    idCatToChange: newCategoryId,
  }

  if (
    categoryData.cat1 === categoryData.catToChange ||
    categoryData.cat2 === categoryData.catToChange ||
    categoryData.cat3 === categoryData.catToChange
  ) {
    const res = await axios
      .patch(
        `http://localhost:5432/remove-priority-category`,
        JSON.stringify(
          categoryData.cat1 === categoryData.catToChange
            ? { category_1: categoryData.cat1 }
            : categoryData.cat2 === categoryData.catToChange
            ? { category_2: categoryData.cat2 }
            : categoryData.cat3 === categoryData.catToChange
            ? { category_3: categoryData.cat3 }
            : ""
        ),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        sendNotification(response.data.success, true)
        return "success"
      })
      .catch((error) => {
        sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
        return "error"
      })
    return res
  } else {
    if (categoryData.cat1 && categoryData.cat2 && categoryData.cat3) {
      return sendNotification("Maximum 3 categories is allowed")
    }
    const res = await axios
      .patch(
        `http://localhost:5432/add-priority-category`,
        JSON.stringify(categoryData),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        sendNotification(response.data.success, true)
        return "success"
      })
      .catch((error) => {
        sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
        return "error"
      })
    return res
  }
}

export const handleProfilePictureChange = async (
  e: React.FormEvent<HTMLFormElement>,
  profilePicture: File | null,
  setProfilePicture: (value: React.SetStateAction<File | null>) => void,
  user: UserTypes,
  dispatch: AppDispatch
) => {
  e.preventDefault()

  if (user?.profile_picture) {
    handlePfpDelete(user.profile_picture, dispatch, true)
  }

  if (profilePicture) {
    const formData = new FormData()
    formData.append("profilePicture", profilePicture)
    axios
      .patch(
        `http://localhost:5432/user-settings/change-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        dispatch(changeProfilePicture(res.data))
      })
      .catch((error) =>
        sendNotification(`${error.response.data.error}, ${errorMsgEnding}`)
      )
  } else {
    sendNotification("No file selected")
  }
  setProfilePicture(null)
}

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setProfilePicture: (value: React.SetStateAction<File | null>) => void
) => {
  const file = e.target.files && e.target.files[0]
  if (file !== undefined && file !== null) {
    setProfilePicture(file)
  }
}
