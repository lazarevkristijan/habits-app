import { Box, Chip, Tooltip, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { RootState } from "../../Store"
import { getPfpLink } from "../../Utils/SettingsUtils"
import { countryShorthands, defaultPfpURL } from "../../constants"
import { displayBio } from "../../components/Shared"
import { UserTypes } from "../../Types"
import { useQuery } from "react-query"
import { getAllHabits } from "../../Utils/ProfileUtils"

const ProfileMainPart = ({
  user,
  completedHabits,
}: {
  user: UserTypes | undefined
  completedHabits: number[]
}) => {
  const colorTheme = useSelector(
    (state: RootState) => state.settings.colorTheme
  )

  const { data: allHabits } = useQuery("get-all-habits", getAllHabits)

  if (!user) return

  return (
    <Box
      sx={{
        bgcolor: `primary.${colorTheme}`,
        borderRadius: 1,
        p: 1,
        mb: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: { xs: "center", md: "space-between" },
        flexDirection: { xs: "column", sm: "row" },
        width: "fit-content",
        mx: "auto",
        mt: 2,
      }}
    >
      <Typography sx={{ mb: 1, textAlign: "center" }}>
        {user.username}
      </Typography>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: "center",
            mb: 2,
            flexDirection: { xs: "column", md: "row" },
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box
              component="img"
              src={getPfpLink(user.profile_picture || defaultPfpURL)}
              sx={{
                objectFit: "cover",
                objectPosition: "center",
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `3px solid ${
                  colorTheme === "dark" ? "white" : "black"
                }`,
              }}
            />
            {(user.first_name || user.last_name || user.country) && (
              <Typography>
                {user.first_name && (
                  <>
                    {user.first_name} <br />
                  </>
                )}
                {user.last_name && (
                  <>
                    {user.last_name} <br />
                  </>
                )}
                {user.country && user.country}
              </Typography>
            )}
          </Box>
          <Tooltip
            title="User No."
            placement="bottom"
            arrow
          >
            <Chip
              label={`#${user.id}`}
              color="primary"
              component="span"
            />
          </Tooltip>

          <Typography>
            Good Habits:
            <Typography
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              {completedHabits.length}{" "}
            </Typography>
            out of{" "}
            <Typography
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              {allHabits?.length}
            </Typography>
          </Typography>

          <Box
            sx={{
              border: "2px solid black",
              width: 200,
              borderRadius: 2,
              mb: 1,
              p: 0.3,
              bgcolor: "white",
              color: "black",
              fontWeight: "bold",
            }}
          >
            <Box
              sx={{
                width: `${Math.round(
                  (completedHabits.length / allHabits?.length) * 100
                )}%`,
                textAlign: "right",
                bgcolor: "green",
                borderRadius: 2,
                color: "#fff",
                pr: 1,
              }}
            >
              {Math.round((completedHabits.length / allHabits?.length) * 100)}%
            </Box>
          </Box>

          <Typography component="span">
            Focused on:{" "}
            {!user.priority_category_1 &&
              !user.priority_category_2 &&
              !user.priority_category_3 &&
              "Not selected"}
          </Typography>
          {user.priority_category_1 && (
            <Chip
              label={user.priority_category_1}
              color="primary"
              component="span"
              sx={{ mb: 1 }}
            />
          )}
          {user.priority_category_2 && (
            <Chip
              label={user.priority_category_2}
              color="primary"
              component="span"
              sx={{ mb: 1 }}
            />
          )}
          {user.priority_category_3 && (
            <Chip
              label={user.priority_category_3}
              color="primary"
              component="span"
              sx={{ mb: 1 }}
            />
          )}

          <Typography>{displayBio(user.bio)}</Typography>
        </Box>
      </Box>

      {user.country && (
        <Box
          component="img"
          src={`/flags/${
            countryShorthands[user.country as keyof typeof countryShorthands]
          }.svg`}
          sx={{ width: 150, height: 150, mx: "auto" }}
        />
      )}
    </Box>
  )
}

export default ProfileMainPart
