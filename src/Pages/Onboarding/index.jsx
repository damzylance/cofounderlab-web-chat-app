import {
  HStack,
  VStack,
  Image,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Container,
  Spinner,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Form, useForm } from "react-hook-form";
import UnuthenticatedApp from "../../Components/UnuthenticatedApp";
import { useNavigate } from "react-router-dom";
import { updateMember, createUser, queryUser } from "../../services/firebase";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { isUserPremium } from "../../services/isUserPremium";
import { createCheckoutSession } from "../../services/createCheckoutSession";

const Onboarding = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [authState, setAuthState] = useState(null);

  const [page, setPage] = useState("");
  const onSubmit = async (data) => {
    if (data.displayName === "") {
      data.displayName = fullName;
    }
    data.uid = uid;
    data.detailsUpdated = true;
    setIsSubmitting(true);

    let array = [];
    const query = await queryUser(uid);
    console.log("my user", query.data());

    const registered = array.filter((user) => {
      return user.email === data.email;
    });
    if (registered.length > 0) {
      toast({ title: "User with email exist already", status: "warning" });
    } else {
      const updated = await updateMember(uid, data);
      if (updated) {
        toast({ title: "Registration Successful", status: "success" });
        navigate("/subscribe");
        createCheckoutSession(uid);
      }
    }
    setIsSubmitting(false);
  };

  // useEffect(() => {
  //   if (user.user !== null) {
  //     console.log("useEffect user", user);
  //     setFullName(user.user.displayName);
  //     setEmail(user.user.email);
  //     setUid(user.user.uid);
  //     const getUserStatus = async () => {
  //       const users = await queryUser("uid", user.user.uid);
  //       console.log("does user exist?", users.docs);
  //       if (users.docs.length > 0) {
  //         if (users.docs[0].data().subscribed === true) {
  //           setPage("chat");
  //           navigate("/channels/general");
  //         } else if (users.docs[0].data().subscribed === false) {
  //           setPage("subscribe");
  //           // navigate("/subscribe");
  //         }
  //       } else {
  //         setUserLoading(false);
  //         setPage("onbarding");
  //       }
  //     };
  //     getUserStatus();
  //   } else {
  //     setPage("login");
  //     console.log("page is login");
  //     navigate("/login");
  //   }
  // }, [user, navigate, page]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserLoading(true);

      if (user) {
        const premium = async () => {
          const premiumUser = await isUserPremium();
          if (premiumUser) {
            navigate("/channels/general");
          } else {
            const getUserStatus = async () => {
              const userData = await queryUser(user.uid);
              if (userData) {
                if (userData.data()?.detailsUpdated === true) {
                  setPage("subscribe");
                  navigate("/subscribe");
                } else {
                  setUserLoading(false);
                  setPage("onbarding");
                }
              } else {
                setUserLoading(false);
                setPage("onbarding");
              }
            };
            getUserStatus();
            setAuthState(true);
            setUserLoading(false);
            setFullName(user.displayName);
            setEmail(user.email);
            setUid(user.uid);
            setPage("onboarding");
          }
        };
        premium();
      } else {
        setAuthState(false);
        setUserLoading(false);
        navigate("/login");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <>
      {userLoading ? (
        <Spinner />
      ) : authState ? (
        <HStack height={"100vh"} overflow={"scroll"}>
          <VStack
            flex={1.5}
            height={["auto", "auto", "100vh"]}
            overflow={"scroll"}
            justifyContent={"center"}
            width={"full"}
            alignItems={"center"}
            gap={5}
            position={"relative"}
            bgImage={"/assets/images/transparentwaves.jpg"}
          >
            <Image
              width={"200px"}
              src="/assets/images/Launch-Logo-Updated.png"
            />
            <Text textAlign={"center"}>
              A few steps away from connecting with thousands of CoFounders
            </Text>

            <form
              style={{ width: "80%", color: "#4F5660" }}
              onSubmit={handleSubmit(onSubmit)}
            >
              <VStack width={"full"} alignItems={"flex-start"} spacing={5}>
                <Text textTransform={"capitalize"} color={"#0461b8"}>
                  Personal Information
                </Text>
                <Text fontSize={"sm"}>Tell us few details about yourself</Text>
              </VStack>
              <VStack mt={5} width={"full"} spacing={5}>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Full Name</FormLabel>
                  <Input
                    type="text"
                    defaultValue={fullName}
                    name="displayName"
                    required
                    {...register("displayName")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Name of Company</FormLabel>
                  <Input
                    type="text"
                    name="company_name"
                    required
                    {...register("company_name")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>
                    A brief description of what you are building
                  </FormLabel>
                  <Textarea
                    type="text"
                    name="company_description"
                    required
                    {...register("company_description")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Biggest Pain point</FormLabel>
                  <Input
                    type="text"
                    name="pain_point"
                    required
                    {...register("pain_point")}
                  />
                </FormControl>
                <Button
                  type="submit"
                  bg={"#0461b8"}
                  color={"#fff"}
                  _hover={{ bg: "#0c8ce9" }}
                  size={"lg"}
                  width={"full"}
                  // onClick={() => navigate("/general")}
                  isLoading={isSubmitting}
                >
                  {" "}
                  Proceed
                </Button>
              </VStack>
            </form>
          </VStack>

          <VStack
            display={["none", "none", "flex"]}
            flex={2}
            height={"100vh"}
            backgroundImage={
              "url(https://cofounderslab.com/assets/images/auth-splash.jpg)"
            }
            bgSize={"cover"}
            bgPosition={"center"}
          ></VStack>
        </HStack>
      ) : (
        "idan"
      )}
    </>
  );
};

export default Onboarding;
