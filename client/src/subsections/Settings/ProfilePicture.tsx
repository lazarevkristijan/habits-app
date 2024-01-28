import { Box, Button, CircularProgress, Typography } from "@mui/material"
import {
  getPfpLink,
  handleFileChange,
  handlePfpDelete,
  handleProfilePictureChange,
} from "../../Utils/SettingsUtils"
import { AppDispatch } from "../../Store"
import { useEffect, useState } from "react"
import { defaultPfpURL } from "../../constants"
import { UserTypes } from "../../Types"

const ProfilePicture = ({
  user,
  dispatch,
}: {
  user: UserTypes
  dispatch: AppDispatch
}) => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const [pfpURL, setPfpURL] = useState("")
  useEffect(() => {
    if (user?.profile_picture) {
      setPfpURL(getPfpLink(user.profile_picture))
    }
  }, [user?.profile_picture])

  const [supportedError, setSupportedError] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  if (!user) return

  return (
    <Box>
      <Typography>Profile picture</Typography>
      <form
        onSubmit={(e) => {
          handleProfilePictureChange(
            e,
            profilePicture,
            setProfilePicture,
            user,
            dispatch,
            setIsUploading
          )
        }}
        encType="multipart/form-data"
      >
        <Box
          width={100}
          height={100}
          borderRadius={20}
          sx={{
            background: `url('${
              user?.profile_picture ? pfpURL : defaultPfpURL
            }') no-repeat center/cover #fff`,
            width: 100,
            height: 100,
            borderRadius: 20,
            border: "3px solid black",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <input
            type="file"
            id="pfpInput"
            name="profilePicture"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              if (e.target.files) {
                if (
                  e.target.files[0].type !== "image/png" &&
                  e.target.files[0].type !== "image/jpeg" &&
                  e.target.files[0].type !== "image/jpg"
                ) {
                  setSupportedError(true)
                  return console.error("File is not from supported types")
                } else if (e.target.files[0].size > 5 * 1048576) {
                  setSizeError(true)
                  return console.error("File is above 5mb")
                } else {
                  const reader = new FileReader()
                  reader.onload = (readerEvent) => {
                    if (readerEvent.target) {
                      const url = readerEvent.target.result
                      if (url) {
                        setPfpURL(url as string)
                      }
                    }
                  }
                  if (e.target.files) {
                    reader.readAsDataURL(e.target.files[0])
                  }
                  handleFileChange(e, setProfilePicture)
                }
              } else {
                return console.error("Error when uploading file")
              }
            }}
            style={{
              opacity: 0,
              width: "100%",
              height: 150,
              bottom: 0,
              backgroundColor: "#555",
              cursor: "pointer",
              position: "absolute",
              borderRadius: 50,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          component="p"
          color="red"
          display={supportedError ? "block" : "none"}
        >
          File is not from supported types
        </Typography>
        <Typography
          variant="caption"
          component="p"
          color="red"
          display={sizeError ? "block" : "none"}
        >
          File is can't be more than 5mb
        </Typography>
        <Typography variant="caption">Max 5mb</Typography>
        <br />
        <Button
          disabled={!profilePicture}
          onClick={() => {
            const inputEl = document.getElementById(
              "pfpInput"
            ) as HTMLInputElement
            inputEl.value = ""
            setProfilePicture(null)

            if (user?.profile_picture) {
              setPfpURL(getPfpLink(user.profile_picture))
            }
          }}
        >
          reset
        </Button>
        <Button
          type="submit"
          disabled={!profilePicture}
        >
          submit
          {isUploading && <CircularProgress size={15} />}
        </Button>
      </form>
      <Button
        onClick={() => {
          setIsDeleting(true)

          handlePfpDelete(
            user?.profile_picture || defaultPfpURL,
            dispatch,
            false
          )
            .then(() => setIsDeleting(false))
            .catch(() => setIsDeleting(false))
        }}
        disabled={
          !user?.profile_picture || user.profile_picture === defaultPfpURL
        }
      >
        delete pfp
      </Button>
      {isDeleting && <CircularProgress size={15} />}
    </Box>
  )
}

export default ProfilePicture
