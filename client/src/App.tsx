import {
  Box,
  Container,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
  createTheme,
} from "@mui/material"
import {
  Home,
  BottomNavbar,
  Profile,
  Habits,
  General,
  NotFound,
  ForgotPassword,
  Settings,
  Search,
} from "./sections"
import { Routes, Route } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "./Store"
import { ReactQueryDevtools } from "react-query/devtools"
import axios from "axios"
import { addHabit } from "./features/completedHabits/completedHabitsSlice"
import { useEffect } from "react"
import { CompletedHabitTypes, UserSettingsTypes } from "./Types"
import {
  changeColorTheme,
  changeLanguage,
} from "./features/settings/settingsSlice"
import MainLoadingScreen from "./skeletons/MainLoadingScreen"
import PreviewProfile from "./sections/PreviewProfile"
import { useAuth0 } from "@auth0/auth0-react"
import { login } from "./features/session/sessionSlice"

const App = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, user: auth0User, isLoading } = useAuth0()
  const user = useSelector((state: RootState) => state.session.user)

  useEffect(() => {
    const postLoginOrRegister = () => {
      axios
        .post(
          "http://localhost:5432/login-or-register",
          JSON.stringify(auth0User),
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          dispatch(login(response.data[0]))
        })
    }

    const getCompletedHabits = () => {
      axios
        .get(`http://localhost:5432/completed-habits/${user?.id}`, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          if (!response.data.length) return

          const habitIds = response.data.map(
            (habit: CompletedHabitTypes) => habit.habit_id
          )
          dispatch(addHabit(habitIds))
        })
    }

    const getUserSettings = () => {
      axios
        .get(`http://localhost:5432/user-settings/${user?.id}`, {
          withCredentials: true,
        })
        .then((response) => {
          const colorTheme = response.data.filter(
            (setting: UserSettingsTypes) => setting.setting_id === 1
          )
          const language = response.data.filter(
            (setting: UserSettingsTypes) => setting.setting_id === 2
          )
          dispatch(changeColorTheme(colorTheme[0].value))
          document.body.style.backgroundColor = colorTheme[0].value
          dispatch(changeLanguage(language[0].value))
        })
    }
    isAuthenticated && postLoginOrRegister()
    isAuthenticated && getCompletedHabits()
    isAuthenticated && getUserSettings()
  }, [isAuthenticated, dispatch, auth0User, user?.id])

  const colorTheme = useSelector(
    (state: RootState) => state.settings.colorTheme
  )

  const theme = createTheme({
    palette: {
      mode: colorTheme as PaletteMode,
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: "contained",
        },
      },
    },
  })

  return (
    <Box>
      {isLoading ? (
        <MainLoadingScreen />
      ) : (
        <ThemeProvider theme={theme}>
          <ReactQueryDevtools />
          <CssBaseline enableColorScheme />
          <Container sx={{ minHeight: "100vh", mt: 2 }}>
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />
              <Route
                path="/user/:id"
                element={<PreviewProfile />}
              />
              <Route
                path="/search"
                element={<Search />}
              />
              <Route
                path="/habits"
                element={<Habits />}
              />
              <Route
                path="/general"
                element={<General />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/settings"
                element={<Settings />}
              />
              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </Container>
          <BottomNavbar />
        </ThemeProvider>
      )}
    </Box>
  )
}

export default App
