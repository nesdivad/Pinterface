import {
	chakra,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Stack,
	FormErrorMessage,
	Button,
	CircularProgress,
	useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import bcryptjs from "bcryptjs"
import { UserLogin } from "../../interfaces/UserLogin"
import { User } from "../../interfaces/User"

export const RegistrationForm: React.FC = () => {
	const [username, setUsername] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [passwordrepeat, setPasswordrepeat] = useState<string>("")
	const [email, setEmail] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [validUsername, setValidusername] = useState<boolean>(true)
	const [validPassword, setValidPassword] = useState<boolean>(true)
	const [validRepPassword, setValidRepPassword] = useState<boolean>(true)
	const [validEmail, setValidemail] = useState<boolean>(true)
	const toast = useToast()

	const checkUsername = (value: string): void => {
		setUsername(value)
		const valid: boolean =
			username.indexOf(" " || "<" || ">" || "!" || "?") === -1
		setValidusername(valid)
	}

	const checkEmail = (value: string): void => {
		if (value.length === 0) {
			setValidemail(true)
			return
		}
		const regex = /\S+@\S+\.\S+/
		const valid = regex.test(value)
		setValidemail(valid)
	}

	//password-validation

	const submitRegistration = async () => {
		if (validUsername && validPassword && validRepPassword && validEmail) {
			const salt: string = await bcryptjs.genSalt(5)
			const hash: string = await bcryptjs.hash(password, salt)
			const userlogin: UserLogin = {
				username: username,
				password: hash,
			}
			const user: User = {
				username: username,
				email: email ?? null,
				devices: [],
				settings: { timeInterval: 3600000 },
			}
			try {
				const loginres: Response = await fetch("/api/register/login", {
					method: "POST",
					body: JSON.stringify(userlogin),
					headers: {
						"Content-Type": "application/json",
					},
					mode: "no-cors",
				})
				if (loginres.status === 500) {
					Error(await loginres.json())
				}
				const userres: Response = await fetch("/api/register/user", {
					method: "POST",
					body: JSON.stringify(user),
					headers: {
						"Content-Type": "application/json",
					},
					mode: "no-cors",
				})
				if (userres.status === 500) {
					Error(await userres.json())
				}
			} catch (e: any) {
				toast({
					title: e.message ?? "An error occurred during registration.",
					duration: 8000,
					status: "error",
					position: "top",
				})
			}
		} else {
			toast({
				duration: 4000,
				status: "warning",
				title: "Please fill out all the required inputs in a correct manner.",
			})
		}
	}

	return (
		<chakra.form>
			<Stack>
				<FormControl id="username">
					<FormLabel as="legend">Choose a username</FormLabel>
					<Input
						isRequired
						placeholder="Username"
						type="text"
						onChange={(e) => checkUsername(e.target.value)}
					/>
					<FormHelperText>
						The username is used for login purposes.
					</FormHelperText>
					{!validUsername && (
						<FormErrorMessage>
							Username is not available, please choose a different name.
						</FormErrorMessage>
					)}
				</FormControl>
				<FormControl id="email">
					<FormLabel as="legend">Add your email</FormLabel>
					<Input
						type="email"
						placeholder="Email"
						onChange={(e) => checkEmail(e.target.value)}
					/>
					<FormHelperText>
						Add your email for alert purposes, not required.
					</FormHelperText>
					{!validEmail && (
						<FormErrorMessage>Email format is incorrect.</FormErrorMessage>
					)}
				</FormControl>
				<FormControl id="password">
					<FormLabel as="legend">Set a password</FormLabel>
					<Input
						isRequired
						placeholder="Password"
						type="password"
						onChange={(e) => {
							setPassword(e.target.value)
						}}
					/>
					<FormHelperText> Minimum 8, maximum 25 characters.</FormHelperText>
					{!validPassword && (
						<FormErrorMessage>
							Password does not meet requirements.
						</FormErrorMessage>
					)}
				</FormControl>
				<FormControl id="passwordrepeat">
					<FormLabel as="legend">Repeat password</FormLabel>
					<Input
						isRequired
						placeholder="Repeat password"
						type="password"
						onChange={(e) => {
							setPasswordrepeat(e.target.value)
						}}
					/>
					{!validRepPassword && (
						<FormErrorMessage>Passwords are not equal.</FormErrorMessage>
					)}
				</FormControl>
				<Button type="submit" colorScheme="blue" size="lg" fontSize="md">
					{isLoading ? (
						<CircularProgress isIndeterminate color="azure" />
					) : (
						"Submit"
					)}
				</Button>
			</Stack>
		</chakra.form>
	)
}
