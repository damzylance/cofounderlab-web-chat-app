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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Form, useForm } from "react-hook-form";
import UnuthenticatedApp from "../../Components/UnuthenticatedApp";
import { useNavigate } from "react-router-dom";
import { createMember, createUser, queryUser } from "../../services/firebase";
const Onboarding = () => {
  const navigate = useNavigate();

  const user = useAuth();
  console.log(user);
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
  const onSubmit = async (data) => {
    if (data.full_name === "") {
      data.full_name = fullName;
    }
    data.email = email;
    data.uid = uid;
    data.subscribed = false;
    console.log(data);
    setIsSubmitting(true);

    let array = [];
    const query = await queryUser("email", email);

    console.log(query);
    query.forEach((doc) => {
      array.push(doc.data());
    });
    console.log(array[0]);
    const registered = array.filter((user) => {
      return user.email === data.email;
    });
    if (registered.length > 0) {
      toast({ title: "User with email exist already", status: "warning" });
    } else {
      const newUser = await createMember(data);
      if (newUser) {
        toast({ title: "Registration Successful", status: "success" });
        navigate("/subscribe");
      }
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    console.log(user);
    if (user.user !== null) {
      setFullName(user.user.displayName);
      setEmail(user.user.email);
      setUid(user.user.uid);
      const getUserStatus = async () => {
        const users = await queryUser("uid", user.user.uid);
        if (users.docs.length > 0) {
          if (users.docs[0].data().subscribed === true) {
            navigate("/general");
          } else if (users.docs[0].data().subscribed === false) {
            navigate("/subscribe");
          }
        }
      };
      getUserStatus();
    } else {
      navigate("/login");
    }
  }, [user]);

  return (
    <>
      <HStack height={"100vh"} overflow={"scroll"}>
        <VStack
          flex={1.5}
          height={"100vh"}
          justifyContent={"center"}
          width={"full"}
          alignItems={"center"}
          gap={5}
          position={"relative"}
          bgImage={"/assets/images/transparentwaves.jpg"}
        >
          <Image width={"200px"} src="/assets/images/Launch-Logo-Updated.png" />
          <Text fontSize>
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
                  name="full_name"
                  required
                  {...register("full_name")}
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
          flex={2}
          height={"100vh"}
          backgroundImage={
            "url(https://cofounderslab.com/assets/images/auth-splash.jpg)"
          }
          bgSize={"cover"}
          bgPosition={"center"}
        ></VStack>
      </HStack>
    </>
  );
};

export default Onboarding;