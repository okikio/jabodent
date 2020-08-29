module.exports = {
    team: [
        {
            name: "John A.B Oyedeji",
            role: "Engineer, Principal Partner",
            keywords:
                "services, engineer, principal partner, nigerian, bachelor of science, marine engineer, maritime, many years of experience, NNSL, inspector, surveyor",
            image: {},
            description: `Safety management system manual (SMS) is an ofﬁcial document that depicts how a shipping company plans and implements policies to ensure safety of their ships and the marine environment`,

            story: `<em>Nationality</em>: Nigerian\n<em>Qualifications</em>: Bachelor of Science\nJohn Moore University, Liverpool, UK\nMember, Nigeria Society of Engineers, British Engineering Council, Institute of Marine Engineers, UK
      
      A graduate of Manufacturing Engineering BSC from the John Moores University,Liverpool, school of Maritime Studies, college of Further Education, Plymouth, United Kingdom, A Class 1 Marine Engineering Certificate of Competency issued by MCA. He has over 43 years Experience in the Marine, Oil and Gas industry with position ranging from onboarding Chief Engineer in the Nigeria National shipping Lines (NNSL), Ships inspector/surveyor for Nigerian government, Non Exclusive Classification Society Surveyor for DNV and Principal Surveyor in-charge for Nigeria and angola with the American Bureau of Shipping (ABS)`,
        },
    //     {
    //         name: "Elizabeth Ufuoma A.",
    //         role: "Engineer, Managing Director, IT Specialist",
    //         keywords:
    //             "engineer, managing director, it specialist, nigerian, bachelor of engineering, architect, managing partner, computer engineering, leader, visionary",
    //         image: {},
    //         description: `Safety management system manual (SMS) is an ofﬁcial document that depicts how a shipping company plans and implements policies to ensure safety of their ships and the marine environment`,

    //         story: `<em>Nationality</em>: Nigerian\n<em>Qualifications</em>: Bachelor of Engineering, Master of Architecture 1995, Managing Partner and IT Specialist
      
    //   Managing Partner and IT Specialist Engr. ELIZABETH UFUOMA .A. is a Managing Partner and IT Specialist, a graduate from the Computer Engineering Department University of Benin, Edo State, and Nigeria. Over 8 years' experience as a Business owner, excellent leadership skills and visionary personality.`,
    //     },
    ].map((person) => {
        let pageURL = `${person.name
            .toLowerCase()
            .replace(/\s|\\|\/|\./g, "-")}.html`;
        return Object.assign(
            {
                pageURL,
                url: `/team/${pageURL}`,
            },
            person
        );
    }),
    services: [
        {
            title: "SMS MANUAL PREPARATION AND REVIEW",
            image: {
                src: "cloudinary/white-boat",
                alt:
                    "An image of a sailing ship in grayscale, by @turbaszek on unsplash.",
            },
            description:
                "Safety management system manual (SMS) is an ofﬁcial document that depicts how a shipping company plans and implements policies to ensure safety of their ships and the marine environment.",
            keywords:
                "safety management, maritime environment, mandatory safety, regulation, training, codes and guidelines",
            article:
                "Safety management system manual (SMS) is an ofﬁcial document that depicts how a shipping company plans and implements policies to ensure safety of their ships and the marine environment. \n\nSafety management system is a vital part of the international safety management code as developed by the International Maritime Organization and it ensures that policies, practices and procedures are established and implemented for the safety of the ships at sea.\n\nThe safety management system also ensures that ships comply with internationally accepted mandatory safety rules and regulation, codes, guidelines and international standard recommended by the various ﬂag administrations, classiﬁcation society and the international maritime organization. \n\nJOCL prepare the safety management system manual as per your organizations structure (whether small or big), train your employees how to implement procedure as per the manual, organize your system to operate effectively and efﬁciently.",
        },
        {
            title: "MARINE FACILITY / EQUIPMENT CONDITION AND VALUE",
            image: {
                src: "cloudinary/sailing-ship",
                alt:
                    "An image of a brown and black ship cruising by @kowalikus on unsplash.",
            },
            description:
                "Condition survey is a stand-alone assessment of the physical and operating condition of Marine Facilities and equipment at that point in time to ascertain its suitability for speciﬁc work scope as required by the client.",
            keywords:
                "condition survey, stand-alone assessment, facility and equipment, structural integrity, insurance, best value and service",
            article:
                "Condition survey is a stand-alone assessment of the physical and operating condition of Marine Facilities and equipment at that point in time to ascertain its suitability for speciﬁc work scope as required by the client. \n\nFacility/Equipment Condition & Value survey is mostly carried out for current owners or for intending charterer for insurance purposes (change of insurance company or risk assurance).\n\nThis inspection is necessary for insurance companies to determine whether or not the vessel is in an acceptable risk considering the structural integrity, machineries, function ability and suitability for the intended purpose as the value of the facility/equipment is a function of the above, ensuring adequate knowledge of the market value and the cost of replacement.\n\n JOCL will serve you right in the survey of your marine facility and equipment against best standard and ensure the best value for the services.",
        },
        {
            title: "PRE-PURCHASE SURVEY",
            image: {
                src: "cloudinary/boat-drag",
                alt:
                    "An image of a ship being moved to another location by @miqul on unsplash.",
            },
            description:
                "Purchasing a Marine facility is a very capital intensive venture and absolute care is necessary to ensure you get the value for your money’s worth.",
            keywords:
                "purchase of marine facility, capital intensive, absolute care, pre-purchase survey, best value and service",
            article:
                "Purchasing a Marine facility is a very capital intensive venture and absolute care is necessary to ensure you get the value for your money’s worth.\n\n A condition and value survey (in this case pre-purchase survey) is possibly the most comprehensive and detailed type of survey and it's a prerequisite in the buying of marine oil and gas facilities as surveyors inspects facilities as per their Class notations, ages, maintenance history and compliance to various standard e.g. Classiﬁcation society, Flag administrations, USCG, API.\n\nThese surveys are mostly conducted aﬂoat and on the dock as status reveals with an inclusion of sea trials.\n\n All ﬁndings during the survey are noted and clearly explained in the written survey report.\n\n An appraisal of the facilities/equipment fair market value in comparison to actual selling prices of comparable facilities/equipment is also included.\n\n These survey and value inspection could also be utilized for insurance and ﬁnancing purposes and JOCL survey reports are acceptable by all insurance companies.\n\n A Condition and Value Survey can also be used for insurance and ﬁnancing purposes.",
        },
        {
            title: "INSURANCE / APPRAISAL SURVEY",
            image: {
                src: "cloudinary/calm-water",
                alt:
                    "An image of a calm body of water by @seefromthesky from unsplash.",
            },
            description:
                "This form of survey is a summarized version of condition and value survey which mostly includes close visual inspection of structures and facility/equipment function-ability with concentration on worthiness and safety of the facility/equipment, the appraisal will also treat the fair market value.",
            keywords:
                "inspection of facility/equipment survey, insurance/appraisal survey",
            article:
                "This form of survey is a summarized version of condition and value survey which mostly includes close visual inspection of structures and facility/equipment function- ability with concentration on worthiness and safety of the facility/equipment, the appraisal will also treat the fair market value. JOCL insurance/appraisal survey reports are acceptable by all insurance companies and ﬁnancing institutions.",
        },
        {
            title: "ON AND OFF HIRE BUNKER / CONDITION SURVEYS",
            image: {
                src: "cloudinary/for-hire",
                alt:
                    "An image of a red and white meter machine on an old London Taxi found in a motor museum by @noblematt on unsplash.",
                class: "object-top",
            },
            description:
                "Bunker on board ship for ships consumption or carried as cargo is an essential part of shipping and a vital part in charter party agreements as the custody of bunker fuel onboard a vessel is transferred from the Owner of the vessel to the Charterer of the vessel when the vessel's charter begins, the reverse is the case when the vessel is redelivered to the owner at the end of the charter.",
            keywords: "bunker survey",
            article:
                "Bunker on board ship for ships consumption or carried as cargo is an essential part of shipping and a vital part in charter party agreements as the custody of bunker fuel onboard a vessel is transferred from the Owner of the vessel to the Charterer of the vessel when the vessel's charter begins, the reverse is the case when the vessel is redelivered to the owner at the end of the charter.\n\n As bunker is often referred to as a consistent and expensive consumable in the operation of the vessel, an exact quantity onboard at the start of the charter and at the end of the charter needs to be established to avoid dispute. \n\nDepending on the charter party agreement between the owners and the charterer, the quantity of all liquid consumables which includes but not limited to the below are recorded and reported on during on hire survey; FO (Fuel Oil), DO (Diesel Oil), LO (Lubricating Oil), MFO (Marine Fuel Oil), MGO (Marine Gas Oil), MO (Marine Diesel Oil), IFO (Intermediate Fuel Oil), HFO (Heavy Fuel Oil.\n\n Same will be surveyed during off hire in other to ascertain any difference in bunker quantity as any excess between the OFF hire quantity and the ON hire quantity is payable by the vessel Owner to the vessel Charterer and any shortage of same is payable by the vessels Charterer to the vessels Owner. \n\nA bunker Surveyor is often employed to sound the tanks independently with well calibrated measuring tools against the approved tank calibration referencing the actual tank height with consideration to the vessels trim and listing conditions, physically check each tanks temperature and bunker viscosity and carefully apply the correction factors when calculating the quantity. \n\nOn hire and off hire survey is not only limited to the bunker, it is also required that the charterer redelivers the vessel in good working condition as delivered by the owner, normal wear and tear excepted. \n\nIt is very important for a charterer to limit their liability by ensuring that all important information concerning the vessels condition is surveyed and reported on by an independent surveyor acting on behalf of the charterer or owner and ﬁnal report utilized as an evidence for their liability during the charter period, this is where JOCL comes in to proffer an independent and unbiased bunker/condition survey solution that ensures that both parties (owners and charterer) ends the venture with assurance of an unprejudiced deal.",
        },
        {
            title: "DRAFT SURVEYS",
            image: {
                src: "cloudinary/sky-and-ship",
                alt:
                    "An image of a brown ship under blue sky during daytime by @ruxandrateodroa on unsplash.",
            },
            description:
                "As implied, Draft Surveys are mostly performed for shippers, receivers, ship owners and ship charterer as well as offshore and shore terminals with the intention of ascertaining the amount of cargo loaded or discharged from a vessel.",
            keywords:
                "draft survey, shippers, receivers, ship owners, ship charterer",
            article:
                "As implied, Draft Surveys are mostly performed for shippers, receivers, ship owners and ship charterer as well as offshore and shore terminals with the intention of ascertaining the amount of cargo loaded or discharged from a vessel.\n\n Draft survey governs accurate measurement of the vessel's displacement before and after loading and the difference between these two displacements is the weight of cargo loaded or discharged.\n\n JOCL quality personnel meticulously conduct draft surveys that serves the purpose and beneﬁt of all parties involved.",
        },
        {
            title: "DAMAGE / REPAIR SURVEY",
            image: {
                src: "cloudinary/ice-scrapper",
                alt:
                    "An image of a cargo ship crossing a large patch of ice by @noaa on unsplash.",
            },
            description:
                "As the name implies, damage and repair surveys are carried out after a facility/equipment have been damaged. It is usually performed to assess the extent of damage for insurance claim or to identify the probability for continuous usage, subsequent to the evaluation of the damage, recommendations are presented and options For repairs (in-situ repairs whilst in operation or off hire repairs), guide as to the cost of repairs and evaluation of the cause of the damage.",
            keywords:
                "damage and repair surveys, shippers, receivers, ship owners, ship charterer",
            article:
                "As the name implies, damage and repair surveys are carried out after a facility/equipment have been damaged.\n\n It is usually performed to assess the extent of damage for insurance claim or to identify the probability for continuous usage, subsequent to the evaluation of the damage, recommendations are presented and options For repairs (in-situ repairs whilst in operation or off hire repairs), guide as to the cost of repairs and evaluation of the cause of the damage. \n\nWith our accumulated experience, most often time's damage surveys are required to be carried out on very short notice offshore or ashore to prevent further damage to the facility/equipment and lost time on charter, JOCL ensures that services for damage survey and oversee of the repair process are carried out as per standardized requirement and completed in a timely manner.",
        },
        {
            title: "DYNAMIC POSITIONING SURVEY (FMEA)",
            image: {
                src: "cloudinary/mountain-ship",
                alt:
                    "An image of a ship cruising on a river beside a mountain on a cloudy day by @redcharlie on unsplash.",
            },
            description:
                "JOCL personnel are expertly trained for the survey and reporting of dynamic positioning control system failure mode effect analysis for all DP2 and DP3 Classed facilities, this is a requirement by the International Maritime Organization (IMO), International Association of Classiﬁcation Societies (IACS) and International Marine Contractors Association (IMCA).",
            article:
                "JOCL personnel are expertly trained for the survey and reporting of dynamic positioning control system failure mode effect analysis for all DP2 and DP3 Classed facilities, this is a requirement by the International Maritime Organization (IMO), International Association of Classiﬁcation Societies (IACS) and International Marine Contractors Association (IMCA). \n\nDynamic positioning control system maintains a ﬂoating structure/facility in a ﬁxed pre-determined position for marine operation purposes by means of dynamically calibrated active thrusters.\n\n JOCL personnel are trained to carry out proving trials (initial survey of the DP system), annual DPS survey (as per standard organization requirement for yearly inspection) and Renewal Survey (carried out ﬁve yearly, mostly done like an initial survey).",
        },
        {
            title: "CARGO LIFTING AND GEAR SURVEY",
            image: {
                src: "cloudinary/pink-sky",
                alt:
                    "An image of a cargo ship underneath a partially cloudy pink evening sky by @snygo on unsplash.",
            },
            description:
                "Cargo/lifting gear survey is a requirement to comply with various organizations for the safety of personnel, goods and the environment as a single failure of a lifting appliances is enough to cause a major disaster.",
            keywords:
                "cargo/lifting gear survey, disaster avoidance, shipping regulation, recalibration of measuring devices",
            article:
                "Cargo/lifting gear survey is a requirement to comply with various organizations for the safety of personnel, goods and the environment as a single failure of a lifting appliances is enough to cause a major disaster.\n\n Organizations such as the International Labor Organization ILO, various ﬂag administrations, Classiﬁcation Societies and the merchant shipping regulation requires that a thorough examination by an expert be carried out at least ones every 12 months and 5 yearly which includes cargo gear retest which requires amongst others replacement of slewing ring bolts, non-destructive examination of load bearing components, load test as appropriate, Replacement of wire (as required), recalibration of measuring devices ETC.\n\n Proof Load test is also required during the initial commissioning of the crane or when a major structural or load bearing component is modiﬁcation or repair is carried out on the crane.\n\n JOCL crane and lifting gear surveyors are adequately trained and harnesses their extensive experience from years of inspecting cranes as Chief Engineers, API inspectors or Classiﬁcation society surveyors, on short notice we are equipped to mobilize to your location ashore or offshore for third party inspection with speciﬁc report acceptable by all classiﬁcation societies and ﬂag administration.",
        },
        {
            title: "INCLINING EXPERIMENTS",
            image: {
                src: "cloudinary/grey-usa-ship",
                alt:
                    "An image of Oceanographic operations on the Coast and Geodetic Survey Ship PIONEER by @noaa on unsplash.",
            },
            description:
                "JOCL Surveyors are expert in developing procedures for inclining experiments, planning and executing the inclining experiment for our clients. Inclining experiment is performed on a ﬂoating facility e.g. ships, rigs and barges to determine its stability, light ship weight and coordinates of its center of gravity at new construction and after a major modiﬁcation of the asset.",
            keywords: "planning and executing the inclining experiment",
            article:
                "JOCL Surveyors are expert in developing procedures for inclining experiments, planning and executing the inclining experiment for our clients.\n\n Inclining experiment is performed on a ﬂoating facility e.g. ships, rigs and barges to determine its stability, light ship weight and coordinates of its center of gravity at new construction and after a major modiﬁcation of the asset. \n\nIt is a process where the ﬂoating facility is deliberately listed by known weight to collate data for calculation of the metacentric height or center of gravity to provide a measure of ships static stability.\n\n It is a known fact that errors associated with this experiments can be overwhelming, however JOCL have developed enough capacity harnessed from years of experience in ship building and new construction to mitigate these errors and uncertainties and report on these experiments with consistent precision.",
        },
        {
            title: "PREPARATORY AUDIT FOR ISM, ISPS AND MLC",
            image: {
                src: "cloudinary/old-ship",
                alt:
                    "An image of an old white ship that is docked by @keithrpotts on unsplash.",
            },
            description:
                "In the bid to save the cost of repeated Audits to satisfy ﬂag administration auditors or their representative recognized organization RO, JOCL have developed a system where ISM, ISPS and MLC audits could be carried out internally both ashore and offshore to ﬁne tune your company's management system, train your employees (both ships and shore crew), prepare your company's safety management manual and review it according to the international safety management code.",
            article:
                "In the bid to save the cost of repeated Audits to satisfy ﬂag administration auditors or their representative recognized organization RO, JOCL have developed a system where ISM, ISPS and MLC audits could be carried out internally both ashore and offshore to ﬁne tune your company's management system, train your employees (both ships and shore crew), prepare your company's safety management manual and review it according to the international safety management code.\n\n Preparing process owners e.g. designated persons (ashore), company security ofﬁcers, quality managers, technical and ﬂeet superintendent, ships ofﬁcers is paramount to successfully achieve a management system that meets international standards. \n\nJOCL auditors have been expertly trained to satisfy your need as they have developed the skills from years of serving various ﬂag administrations and classiﬁcation societies.",
        },
        {
            title:
                "MARINE MAINTENANCE MANAGEMENT AND PLANNED MAINTENANCE SOFTWARE BROKERS",
            image: {
                src: "cloudinary/cargo-ship",
                alt:
                    "An image of a docked ship near shipping containers by @ilangamuwa on unsplash.",
            },
            description:
                'There is a saying that "failure to plan, is planning to fail". Maintenance of equipment installed on your facility is top priority as this is a function of the facilities reliability, consistency, safety of personnel, assets and the environment.',
            keywords: "marine maintenance, plan to succeed",
            article:
                'There is a saying that "failure to plan, is planning to fail", maintenance of equipment installed on your facility is top priority as this is a function of the facilities reliability, consistency, safety of personnel, assets and the environment.\n\n JOCL have made planned maintenance system an off the shelf process as our expertise goes beyond hookup, we start the process by evaluating your facility, your requirement which includes the capacity to which you want the planned maintenance system (PMS) to function, it could be used for maintenance purpose only or used for maintenance monitoring, requisition, HSE management and others. \n\nWe provide ﬂexible speciﬁcation of required maintenance integration with spare inventory, all class surveys and survey check sheets.\n\n JOCL Marine Chief Engineers will embark your facility to populate every details concerning installed equipment, this can be done on newly built facilities or existing facilities, history of repeated failures and incident will be factored into the maintenance system and Future prediction can be instituted in the system.\n\n JOCL machines planned maintenance system to suit speciﬁc needs.',
        },
        {
            title: "MARINE ENGINEERING / NAVAL ARCHITECTURE",
            image: {
                src: "cloudinary/dock-cargo-ship",
                alt:
                    "An image of a cargo ship sailing away from a dock by @filippia on unsplash.",
            },
            description:
                "Marine Engineering / Naval Architecture are closely knitted as both serves the discipline of dealing with Engineering designs, Engineering of ships, oil rigs and other marine vessels and structures, maintenance and operation of marine vessels and structures.",
            keywords: "marine engineering, naval architecture",
            article:
                "Marine Engineering / Naval Architecture are closely knitted as both serves the discipline of dealing with Engineering designs, Engineering of ships, oil rigs and other marine vessels and structures, maintenance and operation of marine vessels and structures.\n\n JOCL provides a total package for marine Engineering services and design solutions with consideration to clients physical and budgetary need epitomize in reality. \n\nIf you are looking at designing commercial vessels, oil exploration platforms, Floating Storage and Ofﬂoading vessels (FSO), Floating Production, Storage and Ofﬂoading vessels (FPSO), Platform supply vessels and anchor handling tug supply vessels, JOCL is the leading Marine Engineering provider to satisfy all designs that meets both statutory and non-statutory requirement.",
        },
        {
            title: "DRY DOCK CONSULTANTS",
            image: {
                src: "cloudinary/docked-ship",
                alt:
                    "An image of a black and white ship on sea during daytime by @glen_rushton on unsplash.",
            },
            description:
                "As easy as it sounds, planning for dry dock, searching for dock space, evaluating quotation considering optimum ships repair cost, preparing drawings, procurement of essential spare part, logistics of expert technicians for specialized equipment maintenance and repairs, aligning of class surveyors and ﬂag administration surveyors and execution of the dry dock is mostly not as easy as it sounds.",
            article:
                "As easy as it sounds, planning for dry dock, searching for dock space, evaluating quotation considering optimum ships repair cost, preparing drawings, procurement of essential spare part, logistics of expert technicians for specialized equipment maintenance and repairs, aligning of class surveyors and ﬂag administration surveyors and execution of the dry dock is mostly not as easy as it sounds. \n\nAs the space between charter are mostly tight, proper planning for vessels dry dock is a top priority for us at JOCL as we know that dry dock is an expensive process that requires systematic and efﬁcient planning and cost estimation to minimize overhead cost. \n\n Experience harnessed from our long term service as Chief Engineers, technical superintendent, technical managers and classiﬁcation society principal surveyor, JOCL have developed a well-tested system that integrates the planning phase to the execution phase and completing phase of Your vessels dry dock, we will closely work with your personnel from start to ﬁnish to ensure delivery in the shortest of time practicable.",
        },
        {
            title: "HIRING OF MARINE EQUIPMENTS AND SPECIALIST",
            image: {
                src: "cloudinary/navigating-seamen",
                alt:
                    "An image of early Twentieth Century Vessels 1900-1939: Plotting the position of the Coast and Geodetic Survey Ship PATHFINDER while operating in Alaskan waters by @noaa on unsplash.",
            },
            description:
                "JOCL operates locally and internationally serving the needs of our customers in hiring of marine equipment and routine and non-routine maintenance of marine equipment that are hired from us, our clients includes shipyards, offshore companies, ship owners, and operators and suppliers of marine equipment, systems and services.",
            article:
                "JOCL operates locally and internationally serving the needs of our customers in hiring of marine equipment and routine and non- routine maintenance of marine equipment that are hired from us, our clients includes shipyards, offshore companies, ship owners, and operators and suppliers of marine equipment, systems and services. \n\nOur expertise goes beyond sourcing for the Equipment; we give you a sense of comfort and reliability because for every equipment we lease out to you, there is a standby in the case of an emergency. Equipment for hire is as listed below: \n\n 1. Diesel Power Generating plant \n2. Inﬂatable and Rigid Fast Rescue Boat 3. Assorted horse power Speed boat Engines \n4. Portable hydraulic or Pneumatic operated winches (1 Ton-30 Tons) \n5. Heavy duty winches (30Tons-150Tons) \n6. Load Cells (50 Tons-500Tons) \n7. Assorted load test water bags (20Tons- 100Tons) \n8. Mobile Cranes (5Tons – 100 Tons) \n9. Sea Going Dumb Barges (1000 GRT -3150 GRT) \n10. Sea Going Tugs (20Tons-150Tons Bollard pull) \n11. Fast Supply Intervention Vessels (FSIV).",
        },
        {
            title: "SPECIALIST TECHNICIAN AND ENGINEERS",
            image: {
                src: "cloudinary/seaman",
                alt:
                    "An image of a man in beige pants and dress shirt cutting signal cloth for draping a hydrographic signal with by @noaa on unsplash.",
            },
            description:
                "Specialist Technicians / Engineers 1. Recognized Organization Welders (Class welders-ABS, DNV-GL, BV, LR)(6GR, 6G e.t.c) 2. Electronics Engineers/IT Engineers (Kongsberg specialist, Beir specialist) 3. Electrical Engineers 4. Mechanical Engineers (CAT specialist, Cummins specialist, EMD specialist).",
            article:
                "_<strong>Specialist Technicians / Engineers</strong> \n1. Recognized Organization Welders (Class welders-ABS, DNV-GL, BV, LR)(6GR, 6G e.t.c) \n 2. Electronics Engineers/IT Engineers (Kongsberg specialist, Beir specialist) \n 3. Electrical Engineers \n 4. Mechanical Engineers (CAT specialist, Cummins specialist, EMD specialist) \n 5. Marine Engineers (Schottel specialist, Plimsoll specialist) \n 6. Marine Air Conditioning Technicians.\n\n Technical Ship Management Services Whatever the ship type and ships location, JOCL have the expertise to manage your vessels from the contract Process, charter party negotiations, manning, technical/maintenance management, spares supplies and management, Government/statutory management, class society and ﬂag administration survey management etc. In ship management, JOCL cultivates whilst our clients reaps with rest of consistency.",
        },
    ].map((service) => {
        let pageURL = `${service.title
            .toLowerCase()
            .replace(/\s|\\|\//g, "-")}.html`;
        return Object.assign(
            {
                pageURL,
                url: `/services/${pageURL}`,
            },
            service
        );
    }),
};
